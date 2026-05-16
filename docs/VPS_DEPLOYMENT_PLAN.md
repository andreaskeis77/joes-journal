# VPS_DEPLOYMENT_PLAN – joes-journal

## 1. Ziel

Dieses Dokument beschreibt den geplanten Betrieb von `joes-journal` auf dem Windows-VPS.

MVP-Entscheidung:

> Native Windows für MVP. Docker später neu bewerten.

## 2. Pfade

DEV-LAPTOP:

```powershell
C:\projekte\joes-journal
```

VPS:

```powershell
C:\joes-journal
C:\joes-journal\data
C:\joes-journal\logs
C:\joes-journal\backups
```

Unterstruktur Vorschlag:

```text
C:\joes-journal\
  repo\
  data\
    postgres\
    directus-uploads\
  logs\
    directus\
    astro\
    deploy\
    backup\
  backups\
    postgres\
    uploads\
    config\
```

## 3. Domains

| Zweck | Domain | Ziel |
|---|---|---|
| Frontend | `zumfettigenjoe.com` | Astro |
| Admin | `admin.zumfettigenjoe.com` | Directus |

Beide zunächst privat via Cloudflare Access.

## 4. Installationsbedarf VPS

- Git
- Node.js LTS
- pnpm
- PostgreSQL
- Directus
- Astro Build-/Runtime-Umgebung
- cloudflared
- Tailscale
- Windows-Service-Mechanismus für Directus/Astro
- Backup-Skripte
- optional: nssm oder WinSW

## 5. Services

Vorläufige Service-Namen:

| Service | Zweck |
|---|---|
| `JoesJournal-PostgreSQL` | PostgreSQL Service |
| `JoesJournal-Directus` | Directus Admin/API |
| `JoesJournal-Astro` | Frontend Runtime, falls nicht statisch |
| `cloudflared` | Cloudflare Tunnel |
| `Tailscale` | Admin-Netz |

## 6. Ports

| Dienst | Host | Port | Zugriff |
|---|---|---:|---|
| PostgreSQL | `127.0.0.1` | 5432 | lokal |
| Directus | `127.0.0.1` | 8055 | Cloudflare Tunnel |
| Astro | `127.0.0.1` | 4321 oder statisch | Cloudflare Tunnel |
| RDP | Tailscale-IP | 3389 | nur Tailscale |

## 7. Cloudflare Tunnel Routes

| Hostname | Service |
|---|---|
| `zumfettigenjoe.com` | `http://localhost:4321` oder statische Auslieferung |
| `admin.zumfettigenjoe.com` | `http://localhost:8055` |

Cloudflare Access:

- Admin immer geschützt
- Frontend im MVP geschützt
- spätere selektive Öffnung möglich

## 8. Environment-Dateien

DEV:

```text
.env.local
```

VPS:

```text
C:\joes-journal\repo\.env
```

Secrets nicht committen. `.env.example` enthält nur Platzhalter.

Mögliche Variablen:

```env
DIRECTUS_SECRET=replace_me
DIRECTUS_ADMIN_EMAIL=replace_me
DIRECTUS_ADMIN_PASSWORD=replace_me
DB_CLIENT=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=joes_journal
DB_USER=joes_journal
DB_PASSWORD=replace_me
PUBLIC_SITE_URL=https://zumfettigenjoe.com
ADMIN_SITE_URL=https://admin.zumfettigenjoe.com
```

## 9. Deploymentfluss

```text
DEV-LAPTOP
  git commit
  git push

VPS
  git pull --ff-only
  pnpm install --frozen-lockfile
  Directus schema apply / migration
  Astro build
  services restart
  smoke tests
```

## 10. Smoke Tests

MVP-Smokes:

- Directus Health erreichbar lokal
- Astro Frontend erreichbar lokal
- Cloudflare Frontend erreichbar mit Access
- Cloudflare Admin erreichbar mit Access
- PostgreSQL Login lokal funktioniert
- Restaurantliste lädt
- Kritikdetail lädt
- Admin Login funktioniert
- Backup-Skript läuft dry-run oder testweise

## 11. Backup

Zu sichern:

- PostgreSQL Dump
- Directus Uploads
- `.env` / Konfiguration
- Directus Schema Snapshot
- Deployment Logs

Backup-Pfade:

```powershell
C:\joes-journal\backups\postgres
C:\joes-journal\backups\uploads
C:\joes-journal\backups\config
```

Mindestanforderung:

- täglicher PostgreSQL Dump
- tägliches Upload-Backup
- Backup-Log
- Restore-Test vor produktivem Ausbau

## 12. Restore-Test

Restore-Test Ziel:

```powershell
C:\joes-journal\restore-test
```

Prüfen:

- DB kann aus Dump wiederhergestellt werden
- Uploads sind vollständig
- Directus startet gegen Restore-DB
- Astro kann Daten lesen

## 13. Rollback

- Code-Rollback via Git
- DB-Rollback nur mit Backup/Restore
- Vor Schemaänderungen Backup erstellen
- Schema-Migrationen dokumentieren
- Kein Blind-Update auf dem VPS ohne Smoke Test

## 14. Monitoring im MVP

Minimal:

- Logdateien
- Service Status
- Health-Endpunkte
- Backup-Erfolg prüfen
- Cloudflare Tunnel Status

Später:

- uptime check
- automatische Benachrichtigung
- Backup-Offsite-Kopie

## 15. Offene Deployment-Entscheidungen

| Entscheidung | Zeitpunkt |
|---|---|
| WinSW vs. NSSM vs. Scheduled Task | vor VPS-Setup |
| Astro statisch vs. Node-Server | vor Frontend-Deployment |
| PostgreSQL Installationspfad | VPS-Setup |
| Cloudflare Access Policies | VPS-Setup |
| Backup-Ziel extern | nach MVP |
