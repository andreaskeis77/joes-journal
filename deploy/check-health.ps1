<#
.SYNOPSIS
  Minimal-Monitoring fuer joes-journal: prueft die kritischen Bausteine und
  alarmiert optional, wenn etwas nicht stimmt.

.DESCRIPTION
  Schliesst die Resilienz-Blindstelle "kein Monitoring": fuer ein privates
  Single-Author-Journal reicht ein leichtgewichtiger Watcher, der die Dinge prueft,
  deren Ausfall sonst erst beim naechsten zufaelligen Besuch auffaellt:

   1. Directus-Health (http://127.0.0.1:8055/server/health == ok)
   2. Frontend/IIS erreichbar (http://127.0.0.1:4321/ liefert 200)
   3. Scheduled Tasks (JoesJournal-Directus / -Auto-Rebuild / -Backup):
      LastTaskResult == 0 (bzw. "noch nie gelaufen"/"laeuft gerade")
   4. Auto-Rebuild-Zustand: lastBuiltAt aus state/auto-rebuild.json nicht zu alt
      (Default 24h) - faengt einen STILL haengenden Publish-Pfad, den ein gruener
      Task-Exit verdecken kann.

  Ergebnis: Log nach C:\joes-journal\logs\deploy\health-*.log. Bei Problemen
  (und gesetztem -NotifyUrl) eine Benachrichtigung; Exit 1, sonst Exit 0.

  Empfehlung: zusaetzlich eine Cloudflare-Health-Notification auf
  https://zumfettigenjoe.com einrichten (erkennt Tunnel-/Edge-Ausfaelle, die ein
  VPS-lokaler Check NICHT sehen kann).

.PARAMETER NotifyUrl
  Optionaler Webhook fuer Alarme (z.B. ntfy-Topic https://ntfy.sh/<topic> oder ein
  generischer POST-Endpunkt). Leer = nur loggen.

.PARAMETER MaxBuildAgeHours
  Schwelle fuer lastBuiltAt-Alter (Default 24).

.PARAMETER RepoRoot
  Default: C:\joes-journal\repo

.EXAMPLE
  .\check-health.ps1
.EXAMPLE
  .\check-health.ps1 -NotifyUrl "https://ntfy.sh/joes-journal-alerts"
#>
[CmdletBinding()]
param(
  [string]$NotifyUrl = "",
  [int]$MaxBuildAgeHours = 24,
  [string]$RepoRoot = "C:\joes-journal\repo",
  [string]$DirectusUrl = "http://127.0.0.1:8055",
  [string]$FrontendUrl = "http://127.0.0.1:4321/"
)

$logDir = "C:\joes-journal\logs\deploy"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force $logDir | Out-Null }
$logFile = Join-Path $logDir ("health-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
function Write-Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  Write-Host $line
  Add-Content -Path $logFile -Value $line
}

$problems = New-Object System.Collections.Generic.List[string]

# 1. Directus-Health.
try {
  $h = Invoke-RestMethod -Uri "$DirectusUrl/server/health" -TimeoutSec 10
  if ($h.status -ne "ok") { $problems.Add("Directus-Health != ok (war: '$($h.status)').") }
  else { Write-Log "Directus-Health: ok" }
} catch {
  $problems.Add("Directus nicht erreichbar ($DirectusUrl): $($_.Exception.Message)")
}

# 2. Frontend/IIS.
try {
  $r = Invoke-WebRequest -Uri $FrontendUrl -UseBasicParsing -TimeoutSec 10
  if ($r.StatusCode -ne 200) { $problems.Add("Frontend HTTP $($r.StatusCode) (erwartet 200).") }
  else { Write-Log "Frontend: HTTP 200" }
} catch {
  $problems.Add("Frontend nicht erreichbar ($FrontendUrl): $($_.Exception.Message)")
}

# 3. Scheduled Tasks. 0 = Erfolg; 0x41303/267011 = noch nie gelaufen;
#    0x41301/267009 = laeuft gerade - beides als ok werten.
$okResults = @(0, 267011, 267009)
foreach ($t in @("JoesJournal-Directus", "JoesJournal-Auto-Rebuild", "JoesJournal-Backup")) {
  $task = Get-ScheduledTask -TaskName $t -ErrorAction SilentlyContinue
  if (-not $task) {
    Write-Log "Task '$t': nicht registriert (Hinweis, kein Alarm)."
    continue
  }
  $info = Get-ScheduledTaskInfo -TaskName $t
  if ($okResults -notcontains $info.LastTaskResult) {
    $problems.Add("Task '$t': LastTaskResult=$($info.LastTaskResult) (LastRun $($info.LastRunTime)).")
  } else {
    Write-Log "Task '$t': LastTaskResult=$($info.LastTaskResult) ok."
  }
}

# 4. Auto-Rebuild-Frische: lastBuiltAt aus dem Zustand ausserhalb des Repos.
$statePath = Join-Path (Split-Path $RepoRoot -Parent) "state\auto-rebuild.json"
if (Test-Path $statePath) {
  try {
    $state = Get-Content $statePath -Raw | ConvertFrom-Json
    if ($state.lastBuiltAt) {
      $age = (Get-Date) - [datetime]$state.lastBuiltAt
      Write-Log ("Auto-Rebuild lastBuiltAt: {0} (vor {1:N1} h)." -f $state.lastBuiltAt, $age.TotalHours)
      if ($age.TotalHours -gt $MaxBuildAgeHours) {
        $problems.Add(("Auto-Rebuild seit {0:N1} h kein erfolgreicher Build (> {1} h Schwelle)." -f $age.TotalHours, $MaxBuildAgeHours))
      }
    }
  } catch {
    Write-Log "WARN: state\auto-rebuild.json nicht lesbar: $($_.Exception.Message)"
  }
} else {
  Write-Log "Hinweis: state\auto-rebuild.json fehlt (Auto-Rebuild lief evtl. noch nie)."
}

# Ergebnis + optionaler Alarm.
if ($problems.Count -eq 0) {
  Write-Log "ALLES OK."
  exit 0
}

$summary = "joes-journal Health-Alarm ($($problems.Count) Problem(e)):`n - " + ($problems -join "`n - ")
Write-Log $summary
if ($NotifyUrl) {
  try {
    Invoke-RestMethod -Method Post -Uri $NotifyUrl -Body $summary -TimeoutSec 15 | Out-Null
    Write-Log "Alarm an $NotifyUrl gesendet."
  } catch {
    Write-Log "WARN: Alarm-Versand an $NotifyUrl fehlgeschlagen: $($_.Exception.Message)"
  }
}
exit 1
