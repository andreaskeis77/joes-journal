<#
.SYNOPSIS
  Content-Rebuild des statischen Astro-Frontends aus Directus.

.DESCRIPTION
  Baut die statische Site (dist/) frisch aus der laufenden Directus-Instanz.
  Verwendet, wenn sich INHALTE in Directus geaendert haben (neue Kritik,
  Status draft->published, Korrekturen). Siehe docs/CONTENT_REBUILD.md.

  Sicherheit:
   - Prueft zuerst die Directus-Health. Ist Directus nicht erreichbar, bricht
     das Skript ab, bevor der Build startet.
   - Atomarer Build: das bestehende dist/ wird vor dem Build beiseitegelegt und
     nur bei Erfolg verworfen. Bricht der Build mittendrin ab (z.B. Directus
     faellt waehrend des Fetch aus, nachdem die Health-Pruefung schon ok war),
     wird das alte dist/ wiederhergestellt - nie eine halb-leere Site.
   - Enthaelt KEINE Secrets. Die Directus-Credentials (JOES_DIRECTUS_URL/EMAIL/
     PASSWORD) kommen aus der gitignored .env im Repo-Root (von Astro/Vite
     automatisch geladen). JOES_DATA_SOURCE wird vom Skript selbst auf "directus"
     gesetzt und muss nicht in der .env stehen.

.PARAMETER RepoRoot
  Pfad zum Repo auf dem VPS. Default: C:\joes-journal\repo

.PARAMETER DirectusUrl
  Loopback-URL der Directus-Instanz fuer den Health-Check.

.PARAMETER WithCodeUpdate
  Zieht vorher 'git pull --ff-only' + 'pnpm install --frozen-lockfile'.
  Ohne diesen Schalter wird nur der Inhalt neu gebaut (kein Code-Update).

.PARAMETER RestartService
  Optionaler Name eines Static-Serving-Dienstes, der nach dem Build neu
  gestartet wird. Leer lassen, wenn dist/ direkt ueber IIS/Cloudflared
  ausgeliefert wird (dann ist kein Restart noetig).

.EXAMPLE
  .\rebuild.ps1
.EXAMPLE
  .\rebuild.ps1 -WithCodeUpdate -RestartService JoesJournal-Astro
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = "C:\joes-journal\repo",
  [string]$DirectusUrl = "http://127.0.0.1:8055",
  [switch]$WithCodeUpdate,
  [string]$RestartService = ""
)

$ErrorActionPreference = "Stop"

$logDir = "C:\joes-journal\logs\deploy"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force $logDir | Out-Null }
$logFile = Join-Path $logDir ("rebuild-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))

function Write-Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  Write-Host $line
  Add-Content -Path $logFile -Value $line
}

try {
  Write-Log "Rebuild gestartet. RepoRoot=$RepoRoot WithCodeUpdate=$WithCodeUpdate"

  if (-not (Test-Path $RepoRoot)) { throw "RepoRoot nicht gefunden: $RepoRoot" }
  Set-Location $RepoRoot

  # 1. Directus-Health pruefen, BEVOR dist/ angetastet wird.
  Write-Log "Pruefe Directus-Health: $DirectusUrl/server/health"
  try {
    $health = Invoke-RestMethod -Uri "$DirectusUrl/server/health" -TimeoutSec 10
  } catch {
    throw "Directus nicht erreichbar unter $DirectusUrl - Rebuild abgebrochen, dist/ bleibt unveraendert. ($_)"
  }
  if ($health.status -ne "ok") {
    throw "Directus-Health != ok (war: '$($health.status)') - Rebuild abgebrochen."
  }
  Write-Log "Directus-Health: ok"

  # 2. Optionales Code-Update.
  if ($WithCodeUpdate) {
    Write-Log "git pull --ff-only"
    git pull --ff-only
    if ($LASTEXITCODE -ne 0) { throw "git pull fehlgeschlagen (exit $LASTEXITCODE)" }
    Write-Log "corepack pnpm install --frozen-lockfile"
    corepack pnpm install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) { throw "pnpm install fehlgeschlagen (exit $LASTEXITCODE)" }
  }

  # 3. Build im Directus-Modus, ATOMAR. JOES_DATA_SOURCE wird hier explizit
  #    gesetzt; die .env im Repo-Root liefert URL/EMAIL/PASSWORD.
  #    astro build leert dist/ zu Beginn - daher legen wir das alte dist/ vorher
  #    beiseite und stellen es bei Build-Fehler wieder her, statt eine
  #    halb-leere Site zu hinterlassen.
  $dist = Join-Path $RepoRoot "dist"
  $distBak = Join-Path $RepoRoot "dist.prev"
  if (Test-Path $distBak) { Remove-Item $distBak -Recurse -Force }
  if (Test-Path $dist) { Rename-Item $dist $distBak }

  $env:JOES_DATA_SOURCE = "directus"
  Write-Log "corepack pnpm build (JOES_DATA_SOURCE=directus)"
  corepack pnpm build
  if ($LASTEXITCODE -ne 0) {
    Write-Log "Build fehlgeschlagen - stelle vorheriges dist/ wieder her."
    if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
    if (Test-Path $distBak) { Rename-Item $distBak $dist }
    throw "pnpm build fehlgeschlagen (exit $LASTEXITCODE)"
  }
  if (Test-Path $distBak) { Remove-Item $distBak -Recurse -Force }
  Write-Log "Build erfolgreich. dist/ aktualisiert."

  # 4. Optionaler Service-Restart (nur falls dist/ nicht direkt ausgeliefert wird).
  if ($RestartService) {
    Write-Log "Starte Dienst neu: $RestartService"
    Restart-Service -Name $RestartService
    Write-Log "Dienst neu gestartet: $RestartService"
  }

  Write-Log "Rebuild fertig. Log: $logFile"
  exit 0
} catch {
  Write-Log "FEHLER: $_"
  exit 1
}
