<#
.SYNOPSIS
  Erstellt ein PostgreSQL-Backup und kopiert es an einen EXTERNEN Ort (E4.2).

.DESCRIPTION
  Schliesst den offenen Punkt P11 (externe Backup-Kopie): ein lokales pg_dump
  allein liegt auf demselben Host wie die DB - faellt der VPS aus, ist auch das
  Backup weg. Dieses Skript dumpt und kopiert die Datei zusaetzlich an ein
  externes Ziel (Netzlaufwerk/UNC-Pfad oder rclone-Remote) und raeumt alte
  Backups nach Aufbewahrungsfrist auf.

  Keine Secrets im Skript: das DB-Passwort kommt aus $env:PGPASSWORD oder der
  PostgreSQL-.pgpass-Datei; rclone-Remotes aus der rclone-Konfiguration.

.PARAMETER ExternalDest
  Externes Ziel. Entweder ein Dateipfad/UNC-Pfad (z.B. \\nas\backups\joes) ODER
  ein rclone-Remote (mit -UseRclone, z.B. "b2:joes-journal/backups").

.PARAMETER UseRclone
  Kopiert per `rclone copy` statt per Copy-Item (fuer Cloud-Remotes).

.PARAMETER RetentionDays
  Lokale Dumps aelter als N Tage werden geloescht. Default: 30.

.PARAMETER PgBin
  Pfad zu pg_dump.exe. Default: C:\Program Files\PostgreSQL\16\bin

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

  # 2. Externe Kopie.
  if ($UseRclone) {
    Write-Log "rclone copy '$dumpFile' '$ExternalDest'"
    rclone copy $dumpFile $ExternalDest
    if ($LASTEXITCODE -ne 0) { throw "rclone copy fehlgeschlagen (exit $LASTEXITCODE)" }
  } else {
    if (-not (Test-Path $ExternalDest)) { New-Item -ItemType Directory -Force $ExternalDest | Out-Null }
    Write-Log "Copy-Item -> $ExternalDest"
    Copy-Item -Path $dumpFile -Destination $ExternalDest -Force
  }
  Write-Log "Externe Kopie ok: $ExternalDest"

  # 3. Lokale Aufbewahrung begrenzen.
  $cutoff = (Get-Date).AddDays(-1 * $RetentionDays)
  $old = Get-ChildItem -Path $LocalBackupDir -Filter "$Database-*.dump" |
    Where-Object { $_.LastWriteTime -lt $cutoff }
  foreach ($f in $old) {
    Remove-Item $f.FullName -Force
    Write-Log "Alt geloescht: $($f.Name)"
  }

  Write-Log "Backup fertig. Restore-Drill-Hinweis: docs/POSTGRES_DRYRUN.md."
  exit 0
} catch {
  Write-Log "FEHLER: $_"
  exit 1
} finally {
  if ($env:PGPASSWORD) { Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue }
}
