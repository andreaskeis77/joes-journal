<#
.SYNOPSIS
  Registriert das taegliche externe Backup (deploy/backup-external.ps1) als
  Scheduled Task (E4.2 / schliesst P11).

.DESCRIPTION
  Ohne registrierten Task laeuft real moeglicherweise GAR KEIN regelmaessiges
  Backup. Dieses Skript legt den Task "JoesJournal-Backup" an: taeglich, als der
  angegebene Admin-Benutzer (RunLevel Highest), mit Nachhol-Logik nach Boot.

  Secrets: das DB-Passwort gehoert NICHT in den Task. Hinterlege es einmalig in
  der PostgreSQL-.pgpass-Datei des Dienstkontos (Format
  `127.0.0.1:5432:joes_journal:postgres:<pwd>` unter
  %APPDATA%\postgresql\pgpass.conf) - backup-external.ps1 nutzt sie automatisch.

.PARAMETER ExternalDest
  Externes Ziel (UNC-Pfad ODER rclone-Remote mit -UseRclone). Wird an
  backup-external.ps1 durchgereicht.

.PARAMETER UseRclone
  Reicht -UseRclone an backup-external.ps1 weiter (Cloud-Remote).

.PARAMETER At
  Uhrzeit des taeglichen Laufs. Default: 03:30 (vor einem optionalen 4-Uhr-Rebuild).

.PARAMETER RepoRoot
  Repo-Pfad auf dem VPS. Default: C:\joes-journal\repo

.PARAMETER TaskName
  Default: JoesJournal-Backup

.PARAMETER User
  Dienstkonto. Default: srv-ops-admin (wie JoesJournal-Directus).

.EXAMPLE
  # In Administrator-PowerShell:
  .\install-backup.ps1 -ExternalDest "\\nas\backups\joes"
.EXAMPLE
  .\install-backup.ps1 -ExternalDest "b2:joes-journal/backups" -UseRclone -At 04:30
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$ExternalDest,
  [switch]$UseRclone,
  [string]$At = "03:30",
  [string]$RepoRoot = "C:\joes-journal\repo",
  [string]$TaskName = "JoesJournal-Backup",
  [string]$User = "srv-ops-admin"
)

$ErrorActionPreference = "Stop"

$script = Join-Path $RepoRoot "deploy\backup-external.ps1"
if (-not (Test-Path $script)) { throw "backup-external.ps1 nicht gefunden: $script" }

# Argument-Liste fuer backup-external.ps1 zusammenbauen (ExternalDest sicher gequotet).
$inner = "-NoProfile -ExecutionPolicy Bypass -File `"$script`" -ExternalDest `"$ExternalDest`""
if ($UseRclone) { $inner += " -UseRclone" }

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $inner -WorkingDirectory $RepoRoot

# Taeglich zur angegebenen Zeit; StartWhenAvailable holt einen verpassten Lauf
# (VPS war aus) nach. Ein Lauf darf max. 2h dauern (grosser Uploads-Spiegel).
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
  -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 10)

$principal = New-ScheduledTaskPrincipal -UserId $User -LogonType S4U -RunLevel Highest

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Write-Host "Task '$TaskName' existiert bereits - wird aktualisiert."
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
  -Settings $settings -Principal $principal `
  -Description "joes-journal taegliches externes Backup (pg_dump + Uploads-Spiegel + Offsite, E4.2/P11)." `
  -ErrorAction Stop | Out-Null

if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
  throw "Task '$TaskName' wurde NICHT registriert - Abbruch."
}

Write-Host "OK: Task '$TaskName' registriert (taeglich $At, Konto $User)."
Write-Host "Voraussetzung: .pgpass des Dienstkontos enthaelt das DB-Passwort (siehe .DESCRIPTION)."
Write-Host "Sofort testen:  Start-ScheduledTask -TaskName $TaskName"
Write-Host "Danach PFLICHT: einen Restore-Drill nach docs/POSTGRES_DRYRUN.md fahren und Ergebnis in DEPLOY_STATE.md festhalten."
Write-Host "Status/Log:     Get-ScheduledTaskInfo -TaskName $TaskName  ·  C:\joes-journal\logs\deploy\backup-*.log"
