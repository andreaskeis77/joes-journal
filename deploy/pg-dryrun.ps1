<#
.SYNOPSIS
  Lokaler PostgreSQL-Trockenlauf fuer joes-journal (vor dem VPS-Deployment).

.DESCRIPTION
  Zieht den kompletten Pfad einmal gegen ein echtes Postgres 16 durch:
  Rolle/DB anlegen -> Directus-.env auf PG umstellen -> bootstrap ->
  schema:apply -> seed -> SEC-1-Check (draft-Review wird NICHT gebaut) ->
  Astro-Build im Directus-Modus -> Assertions -> Teardown.

  Isoliert von der Dev-Umgebung:
   - eigene DB/Rolle (joes_journal_dryrun),
   - eigener Directus-Port (8056, kollidiert nicht mit Dev-Directus auf 8055),
   - sichert das vorhandene directus/.env und stellt es im finally wieder her,
   - droppt DB/Rolle am Ende (ausser -KeepDb).

  Siehe docs/POSTGRES_DRYRUN.md. Voraussetzung: Postgres 16 lokal, psql erreichbar.

.PARAMETER PgBin
  Verzeichnis mit psql.exe. Default: C:\Program Files\PostgreSQL\16\bin
.PARAMETER PgSuperUser
  Postgres-Superuser zum Anlegen von Rolle/DB. Default: postgres
.PARAMETER PgSuperPassword
  Passwort des Superusers. Faellt zurueck auf $env:PGPASSWORD_SUPER.
.PARAMETER KeepDb
  DB/Rolle am Ende NICHT droppen (zum Nachsehen).
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path,
  [string]$PgBin = "C:\Program Files\PostgreSQL\16\bin",
  [string]$PgSuperUser = "postgres",
  [string]$PgSuperPassword = $env:PGPASSWORD_SUPER,
  [int]$DirectusPort = 8056,
  [switch]$KeepDb
)

$ErrorActionPreference = "Stop"

$DbName = "joes_journal_dryrun"
$DbUser = "joes_journal_dryrun"
$DbPassword = "dryrun_local_only"
$AdminEmail = "admin@example.com"
$AdminPassword = "change-me-locally"
$BaseUrl = "http://127.0.0.1:$DirectusPort"
$directusDir = Join-Path $RepoRoot "directus"
$envFile = Join-Path $directusDir ".env"
$envBak = Join-Path $directusDir ".env.dryrun-backup"
$psql = Join-Path $PgBin "psql.exe"

function Write-Log($m) { Write-Host ("[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $m) }

function Invoke-Psql([string]$db, [string]$sql) {
  $env:PGPASSWORD = $PgSuperPassword
  $out = & $psql -U $PgSuperUser -h 127.0.0.1 -d $db -tAc $sql
  if ($LASTEXITCODE -ne 0) { throw "psql fehlgeschlagen: $sql" }
  return ($out | Out-String).Trim()
}

function Wait-Health([int]$timeoutSec = 60) {
  $deadline = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $h = Invoke-RestMethod -Uri "$BaseUrl/server/health" -TimeoutSec 5
      if ($h.status -eq "ok") { return }
    } catch { Start-Sleep -Milliseconds 1500 }
  }
  throw "Directus auf $BaseUrl wurde nicht innerhalb ${timeoutSec}s gesund."
}

function Stop-ByPort([int]$port) {
  $conns = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
  }
}

if (-not $PgSuperPassword) { throw "Superuser-Passwort fehlt: -PgSuperPassword oder `$env:PGPASSWORD_SUPER setzen." }
if (-not (Test-Path $psql)) { throw "psql nicht gefunden unter $psql (-PgBin anpassen)." }

$directusProc = $null
try {
  Write-Log "RepoRoot=$RepoRoot  DirectusPort=$DirectusPort"

  # 1. Rolle + DB idempotent anlegen.
  Write-Log "Lege Rolle/DB an (falls noch nicht vorhanden)..."
  Invoke-Psql "postgres" "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='$DbUser') THEN CREATE ROLE $DbUser LOGIN PASSWORD '$DbPassword'; END IF; END `$`$;" | Out-Null
  $dbExists = Invoke-Psql "postgres" "SELECT 1 FROM pg_database WHERE datname='$DbName';"
  if ($dbExists -ne "1") {
    Invoke-Psql "postgres" "CREATE DATABASE $DbName OWNER $DbUser ENCODING 'UTF8' TEMPLATE template0;" | Out-Null
    Write-Log "DB $DbName angelegt."
  } else {
    Write-Log "DB $DbName existiert bereits - wird wiederverwendet."
  }

  # 2. directus/.env sichern und auf PG umstellen.
  #    Crash-Safety: existiert bereits ein Backup, wurde ein frueherer Lauf hart
  #    abgebrochen (finally lief nicht). Dann NICHT ueberschreiben - sonst geht
  #    die einzige Kopie der echten Dev-.env verloren.
  if (Test-Path $envBak) {
    throw "Stale Backup gefunden: $envBak. Ein frueherer Lauf wurde hart abgebrochen. Bitte directus/.env pruefen, ggf. aus dem Backup wiederherstellen und das Backup loeschen, bevor du erneut startest."
  }
  if (Test-Path $envFile) { Copy-Item $envFile $envBak -Force; Write-Log "directus/.env gesichert -> .env.dryrun-backup" }
  $pgEnv = @"
HOST="127.0.0.1"
PORT="$DirectusPort"
PUBLIC_URL="$BaseUrl"
KEY="dryrun-key-not-for-production-0000000000000000"
SECRET="dryrun-secret-not-for-production"
DB_CLIENT="pg"
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_DATABASE="$DbName"
DB_USER="$DbUser"
DB_PASSWORD="$DbPassword"
ADMIN_EMAIL="$AdminEmail"
ADMIN_PASSWORD="$AdminPassword"
TELEMETRY="false"
"@
  # BOM-frei schreiben: Windows PowerShell 5.1 'Set-Content -Encoding utf8' setzt
  # ein BOM, das den ERSTEN .env-Key (HOST) unbrauchbar macht. .NET ohne BOM.
  [System.IO.File]::WriteAllText($envFile, $pgEnv, (New-Object System.Text.UTF8Encoding($false)))

  # 3. Directus-Migrationen + Admin gegen PG.
  Set-Location $directusDir
  Write-Log "corepack pnpm bootstrap (Directus-Migrationen gegen PG)..."
  corepack pnpm bootstrap
  if ($LASTEXITCODE -ne 0) { throw "pnpm bootstrap fehlgeschlagen" }

  # 4. Directus im Hintergrund starten. Vorher evtl. verwaiste Instanz auf dem
  #    Dryrun-Port beenden, damit Wait-Health nicht gegen eine stale Instanz
  #    (anderes DB/Config) gruen wird.
  Stop-ByPort $DirectusPort
  Write-Log "Starte Directus (Hintergrund)..."
  $directusProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","corepack pnpm start" `
    -WorkingDirectory $directusDir -PassThru -WindowStyle Hidden
  Wait-Health 90
  Write-Log "Directus gesund."

  # 5. Schema gegen PG  (<- OPS-2: FK darf hier nicht brechen).
  Write-Log "corepack pnpm schema:apply (1. Lauf)..."
  corepack pnpm schema:apply
  if ($LASTEXITCODE -ne 0) { throw "schema:apply (1) fehlgeschlagen - pruefe FK/Schema (OPS-2)." }

  # 6. Seed.
  Write-Log "corepack pnpm seed..."
  corepack pnpm seed
  if ($LASTEXITCODE -ne 0) { throw "seed fehlgeschlagen" }

  # 7. OPS-1: zweiter schema:apply muss idempotent sein.
  Write-Log "corepack pnpm schema:apply (2. Lauf, muss idempotent sein)..."
  corepack pnpm schema:apply
  if ($LASTEXITCODE -ne 0) { throw "schema:apply (2) nicht idempotent (OPS-1)." }

  # 8. API-Login + Count-Assertions.
  $login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" `
    -Body (@{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json)
  $token = $login.data.access_token
  $hdr = @{ Authorization = "Bearer $token" }
  $rests = Invoke-RestMethod -Uri "$BaseUrl/items/restaurants?limit=-1&fields=id,slug" -Headers $hdr
  # Nur publizierte zaehlen - so bleibt der Check bei -KeepDb-Wiederholung stabil,
  # auch wenn aus einem frueheren Lauf noch ein Draft in der DB liegt.
  $revs = Invoke-RestMethod -Uri "$BaseUrl/items/restaurant_reviews?limit=-1&fields=id,slug&filter[status][_eq]=published" -Headers $hdr
  Write-Log "API: $($rests.data.Count) Restaurants, $($revs.data.Count) publizierte Kritiken."
  if ($rests.data.Count -ne 8) { throw "Erwartet 8 Restaurants, gefunden $($rests.data.Count)." }
  if ($revs.data.Count -ne 3) { throw "Erwartet 3 publizierte Kritiken, gefunden $($revs.data.Count)." }

  # 9. SEC-1: eine draft-Kritik einschleusen - sie darf NICHT gebaut werden.
  $anyRestId = $rests.data[0].id
  $draftSlug = "dryrun-draft-review"
  # Vorhandenen Draft aus einem frueheren -KeepDb-Lauf entfernen (Slug ist unique,
  # ein erneutes POST wuerde sonst an der Unique-Constraint scheitern).
  $pre = Invoke-RestMethod -Uri "$BaseUrl/items/restaurant_reviews?filter[slug][_eq]=$draftSlug&fields=id" -Headers $hdr
  foreach ($d in $pre.data) {
    Invoke-RestMethod -Uri "$BaseUrl/items/restaurant_reviews/$($d.id)" -Method Delete -Headers $hdr | Out-Null
  }
  Write-Log "Lege draft-Kritik '$draftSlug' an (muss vom Build ausgeschlossen werden)..."
  Invoke-RestMethod -Uri "$BaseUrl/items/restaurant_reviews" -Method Post -Headers $hdr `
    -ContentType "application/json" -Body (@{
      slug = $draftSlug; title = "DRYRUN DRAFT - darf nicht oeffentlich sein";
      status = "draft"; restaurant = $anyRestId; rating = 5; visited_on = "2026-05-01"
    } | ConvertTo-Json) | Out-Null

  # 10. Astro-Build im Directus-Modus gegen PG.
  Set-Location $RepoRoot
  $env:JOES_DATA_SOURCE = "directus"
  $env:JOES_DIRECTUS_URL = $BaseUrl
  $env:JOES_DIRECTUS_EMAIL = $AdminEmail
  $env:JOES_DIRECTUS_PASSWORD = $AdminPassword
  Write-Log "corepack pnpm build (Directus-Modus, PG)..."
  corepack pnpm build
  if ($LASTEXITCODE -ne 0) { throw "pnpm build fehlgeschlagen" }

  # 11. SEC-1-Assertion: keine Seite fuer die draft-Kritik.
  $leak = @(
    (Join-Path $RepoRoot "dist\kritiken\$draftSlug\index.html"),
    (Join-Path $RepoRoot "dist\kritiken\$draftSlug.html")
  ) | Where-Object { Test-Path $_ }
  if ($leak) { throw "SEC-1 VERLETZT: draft-Kritik wurde gebaut -> $leak" }
  Write-Log "SEC-1 ok: draft-Kritik erzeugt keine Seite."

  Write-Log "DRYRUN OK"
  exit 0
}
catch {
  Write-Host "DRYRUN FEHLGESCHLAGEN: $_" -ForegroundColor Red
  exit 1
}
finally {
  # Teardown: Directus stoppen, .env wiederherstellen, DB/Rolle droppen.
  if ($directusProc) { try { Stop-Process -Id $directusProc.Id -Force -ErrorAction SilentlyContinue } catch {} }
  Stop-ByPort $DirectusPort
  if (Test-Path $envBak) { Copy-Item $envBak $envFile -Force; Remove-Item $envBak -Force; Write-Log "directus/.env wiederhergestellt." }
  if (-not $KeepDb) {
    try {
      Invoke-Psql "postgres" "DROP DATABASE IF EXISTS $DbName;" | Out-Null
      Invoke-Psql "postgres" "DROP ROLE IF EXISTS $DbUser;" | Out-Null
      Write-Log "Dryrun-DB/Rolle entfernt."
    } catch { Write-Host "Teardown-Warnung: $_" -ForegroundColor Yellow }
  }
  # Superuser-Passwort nicht in der Session zuruecklassen.
  Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
