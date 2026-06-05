<#
.SYNOPSIS
  Erstellt ein PostgreSQL-Backup + Directus-Uploads-Spiegel und kopiert beides an
  einen EXTERNEN Ort (E4.2 / schliesst P11).

.DESCRIPTION
  Ein lokales pg_dump allein liegt auf demselben Host wie die DB - faellt der VPS
  aus, ist auch das Backup weg. Dieses Skript:
   1. dumpt die DB (custom format) und VERIFIZIERT die Dump-Struktur
      (`pg_restore --list`) - ein "erfolgreicher", aber strukturell unbrauchbarer
      Dump faellt so hier auf, nicht erst im Notfall.
   2. spiegelt die Directus-Original-Uploads (directus/uploads/). WICHTIG: pg_dump
      sichert nur die DB-Zeilen, NICHT die Binaerdateien - ohne diesen Schritt
      haette ein Restore tote File-Referenzen und die Originalfotos waeren weg.
   3. kopiert Dump (Zeitreihe) + Uploads (Spiegel) an ein externes Ziel
      (Netzlaufwerk/UNC oder rclone-Remote).
   4. raeumt alte Dumps nach Aufbewahrungsfrist auf - LOKAL UND EXTERN (frueher
      nur lokal -> das externe Ziel wuchs unbegrenzt). Die Retention greift per
      Dateinamen-Filter NUR auf die Dumps, nie auf die Uploads.

  Keine Secrets im Skript: das DB-Passwort kommt aus $env:PGPASSWORD oder der
  PostgreSQL-.pgpass-Datei; rclone-Remotes aus der rclone-Konfiguration.

.PARAMETER ExternalDest
  Externes Ziel. Entweder ein Dateipfad/UNC-Pfad (z.B. \\nas\backups\joes) ODER
  ein rclone-Remote (mit -UseRclone, z.B. "b2:joes-journal/backups"). Dumps landen
  im Wurzelziel, Uploads im Unterordner "uploads".

.PARAMETER UseRclone
  Kopiert per `rclone` statt per Copy-Item/robocopy (fuer Cloud-Remotes).

.PARAMETER RetentionDays
  Dumps aelter als N Tage werden LOKAL UND EXTERN geloescht. Default: 30.
  Betrifft ausschliesslich "$Database-*.dump" - die Uploads bleiben unberuehrt.

.PARAMETER UploadsDir
  Directus-Upload-Verzeichnis (Originaldateien). Default:
  C:\joes-journal\repo\directus\uploads

.PARAMETER SkipUploads
  Ueberspringt die Uploads-Sicherung (nur DB-Dump).

.PARAMETER PgBin
  Pfad zu pg_dump.exe / pg_restore.exe. Default: C:\Program Files\PostgreSQL\16\bin

.EXAMPLE
  $env:PGPASSWORD = "..."; .\backup-external.ps1 -ExternalDest "\\nas\backups\joes"
.EXAMPLE
  .\backup-external.ps1 -ExternalDest "b2:joes-journal/backups" -UseRclone
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$ExternalDest,
  [switch]$UseRclone,
  [int]$RetentionDays = 30,
  [string]$Database = "joes_journal",
  [string]$DbUser = "postgres",
  [string]$DbHost = "127.0.0.1",
  [string]$LocalBackupDir = "C:\joes-journal\backups",
  [string]$UploadsDir = "C:\joes-journal\repo\directus\uploads",
  [switch]$SkipUploads,
  [string]$PgBin = "C:\Program Files\PostgreSQL\16\bin"
)

$ErrorActionPreference = "Stop"

$logDir = "C:\joes-journal\logs\deploy"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force $logDir | Out-Null }
$logFile = Join-Path $logDir ("backup-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
function Write-Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  Write-Host $line
  Add-Content -Path $logFile -Value $line
}

try {
  $pgDump = Join-Path $PgBin "pg_dump.exe"
  $pgRestore = Join-Path $PgBin "pg_restore.exe"
  if (-not (Test-Path $pgDump)) { throw "pg_dump nicht gefunden: $pgDump" }
  if (-not (Test-Path $LocalBackupDir)) { New-Item -ItemType Directory -Force $LocalBackupDir | Out-Null }

  # 1. Lokaler Dump (custom format).
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $dumpFile = Join-Path $LocalBackupDir ("{0}-{1}.dump" -f $Database, $ts)
  Write-Log "pg_dump -> $dumpFile"
  & $pgDump -U $DbUser -h $DbHost -F c -f $dumpFile $Database
  if ($LASTEXITCODE -ne 0) { throw "pg_dump fehlgeschlagen (exit $LASTEXITCODE)" }
  $size = (Get-Item $dumpFile).Length
  if ($size -lt 1024) { throw "Dump verdaechtig klein ($size Bytes) - Abbruch." }
  Write-Log ("Dump ok ({0:N0} Bytes)." -f $size)

  # 1b. Struktur-Verify: liest das Archiv-Inhaltsverzeichnis OHNE Ziel-DB. Faengt
  #     korrupte/abgebrochene/inkompatible Dumps ab, die der reine Groessen-Check
  #     (>1 KB) durchlaesst.
  if (Test-Path $pgRestore) {
    Write-Log "pg_restore --list (Struktur-Verify)"
    & $pgRestore --list $dumpFile | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "pg_restore --list fehlgeschlagen (exit $LASTEXITCODE) - Dump strukturell unbrauchbar."
    }
    Write-Log "Dump-Struktur ok."
  } else {
    Write-Log "WARN: pg_restore.exe nicht gefunden ($pgRestore) - Struktur-Verify uebersprungen."
  }

  # 2. Externe Kopie des Dumps (Zeitreihe -> akkumuliert, Retention siehe 4).
  if ($UseRclone) {
    Write-Log "rclone copy '$dumpFile' '$ExternalDest'"
    rclone copy $dumpFile $ExternalDest
    if ($LASTEXITCODE -ne 0) { throw "rclone copy (Dump) fehlgeschlagen (exit $LASTEXITCODE)" }
  } else {
    if (-not (Test-Path $ExternalDest)) { New-Item -ItemType Directory -Force $ExternalDest | Out-Null }
    Write-Log "Copy-Item Dump -> $ExternalDest"
    Copy-Item -Path $dumpFile -Destination $ExternalDest -Force
  }
  Write-Log "Externe Dump-Kopie ok: $ExternalDest"

  # 3. Directus-Uploads spiegeln (Originaldateien). pg_dump enthaelt sie NICHT.
  #    Uploads sind ein SPIEGEL des aktuellen Stands (kein Zeitreihen-Backup) ->
  #    sync/MIR statt copy; Retention (4) fasst sie per Filter nie an.
  if (-not $SkipUploads) {
    if (-not (Test-Path $UploadsDir)) {
      Write-Log "WARN: UploadsDir nicht gefunden ($UploadsDir) - Uploads-Sicherung uebersprungen."
    } else {
      $localUploads = Join-Path $LocalBackupDir "uploads"
      if (-not (Test-Path $localUploads)) { New-Item -ItemType Directory -Force $localUploads | Out-Null }
      Write-Log "robocopy /MIR Uploads -> $localUploads"
      robocopy $UploadsDir $localUploads /MIR /R:2 /W:5 /NFL /NDL /NJH /NJS /NP | Out-Null
      # robocopy: Exit < 8 = Erfolg (0..7 sind Status-Codes, kein Fehler).
      if ($LASTEXITCODE -ge 8) { throw "robocopy Uploads-Spiegel fehlgeschlagen (exit $LASTEXITCODE)" }
      Write-Log "Lokaler Uploads-Spiegel ok."

      if ($UseRclone) {
        Write-Log "rclone sync Uploads -> $ExternalDest/uploads"
        rclone sync $localUploads "$ExternalDest/uploads"
        if ($LASTEXITCODE -ne 0) { throw "rclone sync (Uploads) fehlgeschlagen (exit $LASTEXITCODE)" }
      } else {
        $extUploads = Join-Path $ExternalDest "uploads"
        Write-Log "robocopy /MIR Uploads -> $extUploads"
        robocopy $localUploads $extUploads /MIR /R:2 /W:5 /NFL /NDL /NJH /NJS /NP | Out-Null
        if ($LASTEXITCODE -ge 8) { throw "robocopy externer Uploads-Spiegel fehlgeschlagen (exit $LASTEXITCODE)" }
      }
      Write-Log "Externer Uploads-Spiegel ok."
    }
  } else {
    Write-Log "Uploads-Sicherung uebersprungen (-SkipUploads)."
  }

  # 4. Aufbewahrung begrenzen - LOKAL UND EXTERN, ausschliesslich fuer Dumps
  #    ("$Database-*.dump"). Die Uploads bleiben (Spiegel) unberuehrt.
  $cutoff = (Get-Date).AddDays(-1 * $RetentionDays)
  $old = Get-ChildItem -Path $LocalBackupDir -Filter "$Database-*.dump" |
    Where-Object { $_.LastWriteTime -lt $cutoff }
  foreach ($f in $old) {
    Remove-Item $f.FullName -Force
    Write-Log "Lokal alt geloescht: $($f.Name)"
  }

  if ($UseRclone) {
    Write-Log "rclone delete --min-age ${RetentionDays}d (nur Dumps)"
    rclone delete --min-age "${RetentionDays}d" --include "$Database-*.dump" $ExternalDest
    if ($LASTEXITCODE -ne 0) { Write-Log "WARN: externe Dump-Retention (rclone) exit $LASTEXITCODE." }
  } else {
    $extOld = Get-ChildItem -Path $ExternalDest -Filter "$Database-*.dump" -ErrorAction SilentlyContinue |
      Where-Object { $_.LastWriteTime -lt $cutoff }
    foreach ($f in $extOld) {
      Remove-Item $f.FullName -Force
      Write-Log "Extern alt geloescht: $($f.Name)"
    }
  }

  Write-Log "Backup fertig. Restore-Drill-Hinweis: docs/POSTGRES_DRYRUN.md."
  exit 0
} catch {
  Write-Log "FEHLER: $_"
  exit 1
} finally {
  if ($env:PGPASSWORD) { Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue }
}
