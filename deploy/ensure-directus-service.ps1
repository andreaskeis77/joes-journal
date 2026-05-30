<#
.SYNOPSIS
  Stellt den Directus-Task (E1.1) auf Dauerbetrieb um: Start beim Boot, Neustart
  bei Absturz, kein Zeitlimit.

.DESCRIPTION
  Damit das Admin (admin.zumfettigenjoe.com hinter Cloudflare Access) jederzeit
  erreichbar ist, darf Directus nicht nur on-demand laufen. Dieses Skript
  (re-)registriert den Scheduled Task so, dass er beim Systemstart anlaeuft und
  bei einem Absturz automatisch neu startet - analog zu
  install-rebuild-listener.ps1.

  Konto/Rechte: laeuft als der angegebene Admin-Benutzer (srv-ops-admin) mit
  RunLevel Highest, wie bisher. Die Aktion ruft das bestehende Startskript
  scripts/start-directus.ps1 auf (das `corepack pnpm start` ausfuehrt).

  Idempotent: ein vorhandener Task gleichen Namens wird entfernt und mit den
  Dauerbetrieb-Einstellungen neu angelegt. Aendert NICHT die Directus-.env.

.PARAMETER TaskName
  Default: JoesJournal-Directus (der bestehende Task).

.PARAMETER StartScript
  Pfad zum Startskript. Default: C:\joes-journal\scripts\start-directus.ps1

.PARAMETER User
  Dienstkonto. Default: srv-ops-admin.

.EXAMPLE
  # Administrator-PowerShell auf dem VPS:
  .\ensure-directus-service.ps1
#>
[CmdletBinding()]
param(
  [string]$TaskName = "JoesJournal-Directus",
  [string]$StartScript = "C:\joes-journal\scripts\start-directus.ps1",
  [string]$User = "srv-ops-admin"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $StartScript)) { throw "Startskript nicht gefunden: $StartScript" }

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument ("-NoProfile -ExecutionPolicy Bypass -File `"{0}`"" -f $StartScript)

$trigger = New-ScheduledTaskTrigger -AtStartup

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)

$principal = New-ScheduledTaskPrincipal -UserId $User -LogonType S4U -RunLevel Highest

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Write-Host "Task '$TaskName' existiert - wird auf Dauerbetrieb umgestellt."
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
  -Settings $settings -Principal $principal `
  -Description "joes-journal Directus (Dauerbetrieb, Start beim Boot, Neustart bei Absturz)." | Out-Null

Write-Host "Task '$TaskName' auf Dauerbetrieb gesetzt."
Write-Host "Jetzt starten:  Start-ScheduledTask -TaskName $TaskName"
Write-Host "Health-Check:   Invoke-RestMethod http://127.0.0.1:8055/server/health"
