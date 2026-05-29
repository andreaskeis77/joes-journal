# DEPLOY_STATE – joes-journal

**Stand:** 2026-05-29 · **Branch:** `harden/pre-vps-top5`

Tatsächlicher Betriebszustand auf dem VPS (Ergebnis der ersten Live-Inbetriebnahme,
Roadmap P9/P10). Ergänzt den konzeptionellen [VPS_DEPLOYMENT_PLAN.md](VPS_DEPLOYMENT_PLAN.md)
um die real vorgefundenen Werte und ein Betriebs-Runbook.

## 1. Host

- VPS **VMD193069** (Contabo), Windows Server 2025, 6 vCPU, 12 GB RAM, C: ~159 GB frei
- Public IP `84.247.164.122` · Tailscale IP `100.71.205.5`
- Admin-Zugang: RDP **nur über Tailscale**. Joe-Dienste laufen als Konto `srv-ops-admin` (lokaler Admin)
- **Wichtig:** Die Repo-Dateien gehören `BUILTIN\Administrators`. Alle `git`-, `pnpm`- und
  Build-Befehle daher in einer **PowerShell als Administrator** ausführen – sonst scheitert
  z. B. `git checkout` mit `unable to unlink … Invalid argument`.

## 2. Komponenten

| Komponente     | Detail                                                                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node           | v22.22.3 (`C:\Program Files\nodejs`); pnpm über `corepack pnpm` (kein globales Shim)                                                                                         |
| PostgreSQL     | Dienst `postgresql-x64-16`, lokal. DB + Rolle: `joes_journal`. Tools: `C:\Program Files\PostgreSQL\16\bin`                                                                   |
| Directus       | Scheduled Task `JoesJournal-Directus` (als `srv-ops-admin`, RunLevel Highest) → `C:\joes-journal\scripts\start-directus.ps1` → `corepack pnpm start`. Port `8055` (loopback) |
| Frontend       | Astro `static` → `C:\joes-journal\repo\dist`, ausgeliefert von **IIS-Site `JoesJournal-Frontend`** auf `127.0.0.1:4321`                                                      |
| Tunnel         | Cloudflare `Contabo-Wardrobe` (token-/dashboard-gesteuert, Windows-Dienst `Cloudflared` als LocalSystem). Bedient zusätzlich CapsuleWardrobe (`capsule-studio.de`)           |
| Zugriffsschutz | Cloudflare Access-App `zumfettigenjoe.com` (Self-hosted, Allow `andreas.keis@gmail.com`). Team: `wardrobe.cloudflareaccess.com`                                              |

## 3. Pfade & Umgebungsdateien

```text
C:\joes-journal\repo            # Repo (Branch harden/pre-vps-top5)
C:\joes-journal\repo\dist       # statischer Frontend-Output (von IIS ausgeliefert)
C:\joes-journal\repo\.env       # Frontend: JOES_DATA_SOURCE=directus, JOES_DIRECTUS_URL/EMAIL/PASSWORD
C:\joes-journal\repo\directus\.env  # Directus: DB_CLIENT=pg, joes_journal, KEY/SECRET, ADMIN_*
C:\joes-journal\scripts\start-directus.ps1  # Startskript des Directus-Tasks
C:\joes-journal\logs\{directus,deploy}      # Logs
C:\joes-journal\backups                     # PostgreSQL-Dumps
```

Secrets stehen ausschließlich in den `.env`-Dateien und im Cloudflare-Dashboard – nie im Repo.

## 4. Cloudflare-Routing

- **DNS** (Zone `zumfettigenjoe.com`): Apex-CNAME → Tunnel (proxied, von Cloudflare automatisch
  angelegt). Die E-Mail-Records (`mail` A, `MX`, `TXT`/SPF) bleiben unberührt.
- **Tunnel Public Hostname:** `zumfettigenjoe.com` → `HTTP` → **`127.0.0.1:4321`**
  > ⚠️ Muss `127.0.0.1` sein, **nicht** `localhost` – `localhost` löst zu IPv6 `::1` auf, wo die
  > IIS-Site nicht gebunden ist → IIS antwortet mit `400 Bad Request – Invalid Hostname`.
- **Cloudflare Access** davor: privat, nur eigene E-Mail (One-Time-PIN).

## 5. Routine: Inhalt geändert → Seite aktualisieren

Inhalte werden zur **Build-Zeit** aus Directus gezogen (statische Seite). Nach jeder Redaktion
in Directus muss neu gebaut werden:

```powershell
# In PowerShell ALS ADMINISTRATOR:
# 1) Directus laufen lassen (Datenquelle für den Build)
Start-ScheduledTask -TaskName JoesJournal-Directus    # bis http://127.0.0.1:8055/server/health = ok
# 2) atomar neu bauen (SEC-1-Filter aktiv: draft/internal werden nicht ausgeliefert)
cd C:\joes-journal\repo
.\deploy\rebuild.ps1
```

`rebuild.ps1`: prüft Directus-Health → legt altes `dist/` beiseite → `corepack pnpm build`
(`JOES_DATA_SOURCE=directus`) → bei Build-Fehler altes `dist/` zurück. IIS liefert das neue
`dist/` sofort aus. Optional einrichtbar: nächtlicher Task `JoesJournal-Rebuild` als SYSTEM –
siehe [CONTENT_REBUILD.md](CONTENT_REBUILD.md).

## 6. Code-Update Laptop → VPS

```powershell
# Laptop: committen + pushen. Dann auf dem VPS in Administrator-PowerShell:
cd C:\joes-journal\repo
git fetch origin
git checkout <branch>          # bzw. nach PR-Merge: git checkout main; git pull --ff-only
.\deploy\rebuild.ps1
```

`pnpm install --frozen-lockfile` nur, wenn sich `package.json`/Lockfile geändert haben.

## 7. Backup / Restore

```powershell
$ts = Get-Date -Format yyyyMMdd-HHmmss
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U postgres -h 127.0.0.1 -F c `
  -f "C:\joes-journal\backups\joes_journal-$ts.dump" joes_journal
```

Restore-Drill: in eine Test-DB einspielen, Directus dagegen starten, Daten prüfen – siehe
[POSTGRES_DRYRUN.md](POSTGRES_DRYRUN.md) und [VPS_DEPLOYMENT_PLAN.md §12](VPS_DEPLOYMENT_PLAN.md).

## 8. Smoke-Test

```powershell
# Lokal (IIS -> dist)
Invoke-WebRequest http://127.0.0.1:4321/ -UseBasicParsing | Select-Object StatusCode
```

Public: `https://zumfettigenjoe.com` → Access-Login → Joe-Startseite.

## 9. Offene Punkte

- [ ] **Cloudflare-Tunnel-Token rotieren** – war im Klartext exponiert; betrifft denselben Tunnel
      wie CapsuleWardrobe (Connector-Neustart → kurze Unterbrechung beider Seiten)
- [ ] **OPS-2 final:** in der Directus-UI `restaurant_reviews.restaurant` → On Delete = `NO ACTION`
      (Quellcode ist korrekt; die bestehende DB-Relation trägt noch das alte `SET NULL` – latent)
- [ ] **Härtung:** öffentliches RDP (3389) schließen → nur Tailscale; Postgres `listen_addresses`
      von `*` auf `localhost` (gefahrlos – nur `joes_journal` nutzt die Instanz)
- [ ] Hero-Bild oben links fehlt (kosmetisch) – Asset-Pfad prüfen
- [ ] Branch `harden/pre-vps-top5` via PR nach `main` mergen
- [ ] optional: nächtlichen Rebuild-Task einrichten; `admin.zumfettigenjoe.com` (Directus) hinter Access

## 10. Stolperfallen (gelernt bei der Inbetriebnahme)

| Symptom                                                                     | Ursache / Lösung                                                                          |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `git checkout` / `pnpm`: `unable to unlink … Invalid argument` bzw. `EPERM` | Repo-Dateien gehören `BUILTIN\Administrators` → in **Administrator-PowerShell** ausführen |
| `400 Bad Request – Invalid Hostname` nach Access-Login                      | Tunnel-Service-URL war `localhost:4321` → auf **`127.0.0.1:4321`** ändern                 |
| Public Hostname anlegen: „A/AAAA/CNAME record already exists"               | verwaister Apex-CNAME → in DNS löschen, dann Public Hostname neu anlegen                  |
| `rebuild.ps1` bricht ab / leere Seite                                       | Directus lief nicht – erst `Start-ScheduledTask JoesJournal-Directus`, Health abwarten    |
| `node-gyp`/`isolated-vm`-Fehler beim Install                                | Node ≥ 23 → Node **22 LTS** verwenden                                                     |

Quality Gates (Laptop, vor jedem Push): `corepack pnpm lint` / `typecheck` (0/0/0) /
`test` (26 grün) / `build` (35 Seiten) – alle grün.
