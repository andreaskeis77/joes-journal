<#
.SYNOPSIS
  Registriert den Auto-Rebuild-Listener (E1.2) als Scheduled Task.

.DESCRIPTION
  Der Listener (deploy/rebuild-listener.mjs) laeuft als Dauerdienst auf
  127.0.0.1 und startet deploy/rebuild.ps1, wenn ein Directus-Flow-Webhook
  eintrifft (debounced). Dieses Skript legt einen Scheduled Task an, der den
  Listener beim Systemstart startet und bei Absturz neu startet.

  Konto/Rechte: laeuft als der angegebene Admin-Benutzer mit hoechsten Rechten
  (RunLevel Highest), weil rebuild.ps1 wegen der Datei-Ownership
  (BUILTIN\Administrators) Elevation braucht - analog zum Task
  JoesJournal-Directus.

  Secret: JOES_REBUILD_TOKEN muss in C:\joes-journal\repo\.env stehen (der
  Listener liest die .env selbst). Das Token steht NICHT im Task oder in
  diesem Skript.

.PARAMETER RepoRoot
  Repo-Pfad auf dem VPS. Default: C:\joes-journal\repo

.PARAMETER TaskName
  Name des Scheduled Task. Default: JoesJournal-Rebuild-Listener

.PARAMETER User
  Dienstkonto. Default: srv-ops-admin (wie JoesJournal-Directus).

.PARAMETER NodeExe
  Pfad zu node.exe. Default: "C:\Program Files\nodejs\node.exe"

.EXAMPLE
  # In Administrator-PowerShell:
  .\install-rebuild-listener.ps1 -User srv-ops-admin
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = "C:\joes-journal\repo",
  [string]$TaskName = "JoesJournal-Rebuild-Listener",
  [string]$User = "srv-ops-admin",
  [string]$NodeExe = "C:\Program Files\nodejs\node.exe"
)

$ErrorActionPreference = "Stop"

$listener = Join-Path $RepoRoot "deploy\rebuild-listener.mjs"
if (-not (Test-Path $listener)) { throw "Listener nicht gefunden: $listener" }
if (-not (Test-Path $NodeExe))  { throw "node.exe nicht gefunden: $NodeExe" }

# .env-Pruefung (Token muss vorhanden sein; wir lesen es NICHT aus).
$envFile = Join-Path $RepoRoot ".env"
if (-not (Test-Path $envFile)) {
  Write-Warning ".env fehlt unter $envFile - JOES_REBUILD_TOKEN dort eintragen, sonst startet der Listener nicht."
} elseif (-not (Select-String -Path $envFile -Pattern "^\s*JOES_REBUILD_TOKEN\s*=" -Quiet)) {
  Write-Warning "JOES_REBUILD_TOKEN fehlt in .env - bitte ein langes Zufallstoken (>= 16 Zeichen) eintragen."
}

$action = New-ScheduledTaskAction -Execute $NodeExe `
  -Argument "deploy\rebuild-listener.mjs" -WorkingDirectory $RepoRoot

# Beim Systemstart starten.
$trigger = New-ScheduledTaskTrigger -AtStartup

# Dauerbetrieb: kein Zeitlimit, bei Absturz bis zu 999x im 1-Minuten-Takt neu.
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)

$principal = New-ScheduledTaskPrincipal -UserId $User -LogonType S4U -RunLevel Highest

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Write-Host "Task '$TaskName' existiert bereits - wird aktualisiert."
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
  -Settings $settings -Principal $principal `
  -Description "joes-journal Auto-Rebuild-Listener (E1.2), loopback 127.0.0.1." | Out-Null

Write-Host "Task '$TaskName' registriert. Starten mit: Start-ScheduledTask -TaskName $TaskName"
Write-Host "Health-Check: Invoke-RestMethod http://127.0.0.1:8787/health"
