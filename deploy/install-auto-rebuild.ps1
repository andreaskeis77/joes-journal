<#
.SYNOPSIS
  Registriert den robusten Auto-Rebuild-Poll (deploy/auto-rebuild.mjs) als
  Scheduled Task.

.DESCRIPTION
  Ersetzt den fragilen Directus-Flow + Webhook + Token. Der Task laeuft alle
  paar Minuten, fragt Directus nach der juengsten Inhaltsaenderung und baut nur
  bei Bedarf neu (siehe deploy/auto-rebuild.mjs). Kein offener Port, kein Token.

  Konto/Rechte: laeuft als der angegebene Admin-Benutzer mit hoechsten Rechten
  (RunLevel Highest), weil rebuild.ps1 wegen der Datei-Ownership
  (BUILTIN\Administrators) Elevation braucht - analog zu JoesJournal-Directus.

  Keine Ueberlappung: MultipleInstances IgnoreNew -> waehrend ein Build laeuft,
  wird der naechste Tick uebersprungen.

  Zugangsdaten: JOES_DIRECTUS_URL/EMAIL/PASSWORD muessen in
  C:\joes-journal\repo\.env stehen (das Skript liest sie selbst, NICHT dieser
  Task). Es sind dieselben, die der Build nutzt.

.PARAMETER RepoRoot
  Repo-Pfad auf dem VPS. Default: C:\joes-journal\repo

.PARAMETER TaskName
  Name des Scheduled Task. Default: JoesJournal-Auto-Rebuild

.PARAMETER User
  Dienstkonto. Default: srv-ops-admin (wie JoesJournal-Directus).

.PARAMETER IntervalMinutes
  Poll-Intervall in Minuten. Default: 3

.PARAMETER NodeExe
  Pfad zu node.exe. Default: "C:\Program Files\nodejs\node.exe"

.EXAMPLE
  # In Administrator-PowerShell:
  .\install-auto-rebuild.ps1 -User srv-ops-admin
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = "C:\joes-journal\repo",
  [string]$TaskName = "JoesJournal-Auto-Rebuild",
  [string]$User = "srv-ops-admin",
  [int]$IntervalMinutes = 3,
  [string]$NodeExe = "C:\Program Files\nodejs\node.exe"
)

$ErrorActionPreference = "Stop"

$script = Join-Path $RepoRoot "deploy\auto-rebuild.mjs"
if (-not (Test-Path $script)) { throw "auto-rebuild.mjs nicht gefunden: $script" }
if (-not (Test-Path $NodeExe)) { throw "node.exe nicht gefunden: $NodeExe" }

# .env-Pruefung (Directus-Zugangsdaten muessen vorhanden sein; wir lesen sie NICHT aus).
$envFile = Join-Path $RepoRoot ".env"
if (-not (Test-Path $envFile)) {
  Write-Warning ".env fehlt unter $envFile - JOES_DIRECTUS_EMAIL/PASSWORD dort eintragen, sonst baut der Task nicht."
} elseif (-not (Select-String -Path $envFile -Pattern "^\s*JOES_DIRECTUS_PASSWORD\s*=" -Quiet)) {
  Write-Warning "JOES_DIRECTUS_PASSWORD fehlt in .env - bitte eintragen (dieselben Daten wie der Build)."
}

$action = New-ScheduledTaskAction -Execute $NodeExe `
  -Argument "deploy\auto-rebuild.mjs" -WorkingDirectory $RepoRoot

# Alle N Minuten, unbegrenzt wiederholen. Auf Windows Server 2016+ erzeugt ein
# -RepetitionInterval OHNE -RepetitionDuration die Wiederholung "Indefinitely".
# (Ein expliziter MaxValue-Duration-Wert wird vom Task Scheduler als
# "out of range" abgelehnt -> daher bewusst weggelassen.)
# StartWhenAvailable holt verpasste Laeufe nach Boot nach.
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
  -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes)

# Keine Ueberlappung; bei Absturz neu; ein Lauf darf max. 1h dauern (Backstop).
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
  -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)

$principal = New-ScheduledTaskPrincipal -UserId $User -LogonType S4U -RunLevel Highest

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Write-Host "Task '$TaskName' existiert bereits - wird aktualisiert."
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
  -Settings $settings -Principal $principal `
  -Description "joes-journal robuster Auto-Rebuild-Poll (alle $IntervalMinutes Min, kein Flow/Webhook/Token)." `
  -ErrorAction Stop | Out-Null

# Erfolg HART pruefen, bevor irgendetwas anderes passiert (sonst nie faelschlich
# "registriert" melden oder den alten Listener abschalten).
if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
  throw "Task '$TaskName' wurde NICHT registriert - Abbruch (alter Mechanismus bleibt unangetastet)."
}

# Cutover erst NACH erfolgreicher Registrierung: den alten Webhook-Listener
# (Port 8787 / JOES_REBUILD_TOKEN) deaktivieren, damit nie ZWEI Mechanismen
# gleichzeitig rebuild.ps1 starten (Build-Korruption) und das "kein Port / kein
# Token"-Ziel real wird.
$oldListener = "JoesJournal-Rebuild-Listener"
if (Get-ScheduledTask -TaskName $oldListener -ErrorAction SilentlyContinue) {
  Stop-ScheduledTask -TaskName $oldListener -ErrorAction SilentlyContinue
  Disable-ScheduledTask -TaskName $oldListener | Out-Null
  Write-Warning "Alten Webhook-Listener '$oldListener' (Port 8787/Token) gestoppt & deaktiviert - nicht mehr noetig."
  Write-Warning "WICHTIG: Den Directus-Flow (Settings -> Flows -> Auto-Rebuild) im Admin LOESCHEN, sonst feuert er ins Leere."
}

$rep = (Get-ScheduledTask -TaskName $TaskName).Triggers.Repetition
$dur = if ($rep.Duration) { $rep.Duration } else { "Indefinitely" }
Write-Host "OK: Task '$TaskName' registriert. Wiederholung: Interval=$($rep.Interval) Duration=$dur"
Write-Host "Starten:        Start-ScheduledTask -TaskName $TaskName"
Write-Host "Manueller Test: node deploy\auto-rebuild.mjs"
Write-Host "Status/Log:     Get-ScheduledTaskInfo -TaskName $TaskName"
