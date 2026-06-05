# DEPLOY_STATE – joes-journal

**Stand:** 2026-06-05 · **Branch:** `main` (VPS-Live); Review-Fixes auf `review-fixes-2026-06` (siehe §9)

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
| Admin-Zugang   | `admin.zumfettigenjoe.com` über denselben Tunnel → `HTTP 127.0.0.1:8055`, eigene Access-App „Joe Admin" (Owner-Mail). Directus-Login mit Secure-Cookies (E1.1)                  |
| Auto-Rebuild   | Scheduled Task **`JoesJournal-Auto-Rebuild`** (alle 3 Min, `srv-ops-admin`) → `deploy/auto-rebuild.mjs`: pollt `directus_activity`, startet bei Änderung `rebuild.ps1`. Ersetzt Flow/Webhook/Listener (E1.2) |

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
- **Admin (E1.1):** zweiter Public Hostname `admin.zumfettigenjoe.com` → `HTTP` → **`127.0.0.1:8055`**
  (gleicher `127.0.0.1`-Caveat) + eigene Access-App „Joe Admin" (Allow Owner-Mail). Damit ist die
  Redaktion vom Laptop möglich; Port 8055 bleibt loopback. `directus/.env` setzt dafür `PUBLIC_URL`
  **und** `SESSION_COOKIE_SECURE/SAME_SITE` + `REFRESH_TOKEN_COOKIE_SECURE/SAME_SITE` (Secure-Cookies,
  sonst Login-Loop hinter dem HTTPS-Edge).

## 5. Routine: Inhalt geändert → Seite aktualisieren

> **Seit 2026-06 automatisch:** Der Task `JoesJournal-Auto-Rebuild` pollt alle 3 Min und baut bei
> einer Inhaltsänderung selbst (siehe [CONTENT_REBUILD.md §5](CONTENT_REBUILD.md)). „Speichern → Live"
> braucht also **keinen** manuellen Eingriff mehr. Die folgenden Befehle sind nur noch für manuelle
> Sofort-Builds bzw. Code-Updates nötig.

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

**Externe Kopie (E4.2, schließt P11):** `deploy/backup-external.ps1` dumpt die DB **und
verifiziert sie** (`pg_restore --list`), **spiegelt zusätzlich `directus/uploads/`** (pg_dump
sichert nur DB-Zeilen, NICHT die Original-Fotos!), kopiert beides offsite (UNC/rclone) und räumt
Dumps **lokal UND extern** nach Aufbewahrungsfrist auf. Als täglichen Task registrieren:

```powershell
# Voraussetzung: DB-Passwort in der .pgpass des Dienstkontos (kein Secret im Task).
.\deploy\install-backup.ps1 -ExternalDest "\\nas\backups\joes"      # oder: -ExternalDest "b2:…" -UseRclone
Start-ScheduledTask -TaskName JoesJournal-Backup
# DANACH PFLICHT: einen Restore-Drill nach POSTGRES_DRYRUN.md fahren und hier festhalten.
```

**Monitoring (`deploy/check-health.ps1`):** prüft Directus-Health, Frontend/IIS,
`LastTaskResult` der Tasks und die Frische von `state/auto-rebuild.json`; bei Problemen optional
Alarm via `-NotifyUrl` (ntfy/Webhook). Als eigenen Task (z. B. alle 30 Min) registrieren und
zusätzlich eine **Cloudflare-Health-Notification** auf `zumfettigenjoe.com` aktivieren (erkennt
Tunnel-/Edge-Ausfälle, die ein VPS-lokaler Check nicht sieht).

## 8. Smoke-Test

```powershell
# Lokal (IIS -> dist)
Invoke-WebRequest http://127.0.0.1:4321/ -UseBasicParsing | Select-Object StatusCode
```

Public: `https://zumfettigenjoe.com` → Access-Login → Joe-Startseite.

## 9. Status der Maßnahmen

**Erledigt (2026-05-29):**

- [x] Cloudflare-Tunnel-Token rotiert
- [x] OPS-2: FK `restaurant_reviews.restaurant` → `ON DELETE NO ACTION` (DB verifiziert: `confdeltype = a`)
- [x] Postgres `listen_addresses` von `*` → `localhost` (`ALTER SYSTEM` + Dienst-Neustart)
- [x] Asset-MIME: `public/web.config` ergänzt → IIS liefert `.webp` als `image/webp` (Hero-Bild sichtbar)
- [x] Frontend live & privat: `zumfettigenjoe.com` über Tunnel `Contabo-Wardrobe` + Cloudflare Access

**Erledigt (2026-06-03/04) – Editor-Ausbau, robuster Auto-Rebuild, Admin-Zugang:**

- [x] **Branch gemerged:** `harden/pre-vps-top5` → `main` (PR #1); seitdem läuft alles auf `main`.
- [x] **Sauberer Inhalt:** Seed-Dummydaten entfernt (`pnpm purge:seed`), nur noch echte Artikel.
- [x] **Journal-Editor (E3.1+, [DIRECTUS_EDITOR_UX.md](DIRECTUS_EDITOR_UX.md)):** `body` vom kaputten
      `list`-Repeater (`[object Object]`) auf **WYSIWYG-HTML** (`input-rich-text-html`) – Frontend
      saniert (`sanitize-html`) + `set:html`. Typwechsel war manuell (Feld löschen → `pnpm schema:apply`).
- [x] **Absatz-Bilder:** im Body eingefügte Directus-Bilder werden beim Build nach `public/_uploads/`
      gebacken + URL umgeschrieben (`bake-files.mjs` 1b, `rewriteBodyAssets`).
- [x] **Galerie:** echte **m2m** auf `directus_files` (`articles_files`-Junction + Feld `gallery_files`,
      via `pnpm schema:apply`); UUIDs werden gebacken (`bake-files.mjs` 1c, `resolveGallery`).
- [x] **Deutsche Feld-UX (E1.4):** `pnpm fields:refine` – Übersetzungen, Feldgruppen
      (Inhalt/Bilder/SEO/Verknüpfungen), Hero-Relabel „Titelbild", Legacy-Felder versteckt.
- [x] **Cache-Fix:** `public/web.config` setzt HTML auf `no-cache` (frische Inhalte ohne Strg+F5),
      nur `/_astro` immutable.
- [x] **Robuster Auto-Rebuild (E1.2 neu):** Poll-Task **`JoesJournal-Auto-Rebuild`**
      (`deploy/auto-rebuild.mjs` + `install-auto-rebuild.ps1`, alle 3 Min) ersetzt Flow+Webhook+Token.
      Alter `JoesJournal-Rebuild-Listener` automatisch deaktiviert, Directus-Flow gelöscht. Verifiziert:
      `LastTaskResult 0`, Erstlauf-Baseline-Build ok.
- [x] **Admin von überall (E1.1):** `admin.zumfettigenjoe.com` (Tunnel → `127.0.0.1:8055` + Access-App).
      `directus/.env` um `PUBLIC_URL` + die vier `*_COOKIE_*`-Zeilen ergänzt; Directus via Stop/Start
      neu gestartet, Health `ok`.

**Erledigt (2026-06-05) – Review-Fixes (Branch `review-fixes-2026-06`, aus [REVIEW_2026-06.md](REVIEW_2026-06.md)):**

- [x] **Resilienz:** `rebuild.ps1` crash-fester `dist.prev`-Recovery (keine leere Live-Site mehr nach
      Mid-Build-Abbruch); `auto-rebuild.mjs` erkennt `directus_activity`-Rotation/Reset (kein stiller
      Dauer-Stillstand nach DB-Restore) + Netzwerk-Timeouts.
- [x] **Backup/Monitoring (Code):** `backup-external.ps1` sichert jetzt auch `directus/uploads/`,
      verifiziert den Dump und räumt extern auf; neu `install-backup.ps1` (Task-Registrierung) und
      `check-health.ps1` (Monitoring). **Live-Ausführung = Handoff** (siehe Offen).
- [x] **Kritik-Editor:** `restaurant_reviews.body` auf WYSIWYG umgestellt (Code/Schema/Mapper/Renderer/
      Bake), behebt den `[object Object]`-Bug im Kern-Inhaltstyp. **Live-Typänderung = Handoff** (json→text
      nicht additiv, [DIRECTUS_EDITOR_UX.md](DIRECTUS_EDITOR_UX.md)).
- [x] **Admin-UX:** `fields:refine` deckt jetzt zusätzlich `restaurants` + `restaurant_reviews` ab
      (deutsche Labels/Feldgruppen/Titelbild). Re-Run `pnpm fields:refine` auf dem VPS nötig.
- [x] **Besucher-UX:** Alt-Texte für Inhaltsbilder, Leere-Zustände (Start-/Zutaten-Seite), `404.astro`
      (+ IIS-`httpErrors`), Invalid-Date-Guard, toter Watchlist-Chip + „frisch besucht"-Filter gefixt.
- [x] **SEC-1-Konsistenz:** `seed.ts` übernimmt den echten Review-Status (kein hartes „published") und
      nutzt die kanonische Slug-Quelle (E2-Konsistenz).

**Offen:**

- [ ] **Letzte E1.1-Verifikation:** Laptop-Login `https://admin.zumfettigenjoe.com` ohne Loop (Inkognito).
- [ ] **Härtung RDP:** öffentliches RDP (3389) auf Tailscale beschränken –
      `Get-NetFirewallRule -DisplayGroup "Remote Desktop" | Set-NetFirewallRule -RemoteAddress 100.64.0.0/10`
      (nur ausführen, wenn per Tailscale verbunden; Revert: `-RemoteAddress Any`)
- [ ] **E4.2 externe Backups LIVE:** `install-backup.ps1` ausführen (.pgpass einrichten) + erster Restore-Drill.
- [ ] **Monitoring LIVE:** `check-health.ps1` als Task (alle 30 Min) + Cloudflare-Health-Notification.
- [ ] **Kritik-Body LIVE:** Feldtyp `restaurant_reviews.body` json→text manuell im Data-Model umstellen
      (nicht additiv), dann `pnpm fields:refine` + `rebuild.ps1`. Live-Kritiktexte vorher sichern.
- [ ] **Admin-UX LIVE:** `pnpm fields:refine` auf dem VPS (deutsche Feldgruppen für Restaurants/Kritiken).
- [ ] **E2 relationale Migration** (Taxonomien/Tags/Links) – backup-gesichert, noch nicht ausgeführt.
- [ ] optional: nächtlichen `JoesJournal-Rebuild`-Backstop (SYSTEM, 4 Uhr) zusätzlich einrichten.

## 10. Stolperfallen (gelernt bei der Inbetriebnahme)

| Symptom                                                                     | Ursache / Lösung                                                                          |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `git checkout` / `pnpm`: `unable to unlink … Invalid argument` bzw. `EPERM` | Repo-Dateien gehören `BUILTIN\Administrators` → in **Administrator-PowerShell** ausführen |
| `400 Bad Request – Invalid Hostname` nach Access-Login                      | Tunnel-Service-URL war `localhost:4321` → auf **`127.0.0.1:4321`** ändern                 |
| Public Hostname anlegen: „A/AAAA/CNAME record already exists"               | verwaister Apex-CNAME → in DNS löschen, dann Public Hostname neu anlegen                  |
| `rebuild.ps1` bricht ab / leere Seite                                       | Directus lief nicht – erst `Start-ScheduledTask JoesJournal-Directus`, Health abwarten    |
| `node-gyp`/`isolated-vm`-Fehler beim Install                                | Node ≥ 23 → Node **22 LTS** verwenden                                                     |
| `[object Object]` im Artikel-Body                                           | Body-Feld war `list`-Repeater (leere Objekte) → auf `input-rich-text-html` (Feld löschen + `schema:apply`) |
| Veröffentlicht, aber Seite sieht unverändert aus                            | Browser-Cache von HTML → `public/web.config` `no-cache` (gefixt); einmalig Strg+F5 für alte Caches |
| `Restart-ScheduledTask` „not recognized"                                    | Cmdlet existiert nicht → `Stop-ScheduledTask` + `Start-ScheduledTask` (mit kurzem Sleep)  |
| Task-Registrierung „value out of range" (`P99999999D…`)                     | `-RepetitionDuration ([TimeSpan]::MaxValue)` wird abgelehnt → ganz weglassen (= „Indefinitely") |
| Admin-Login hinter Access dreht endlos / loggt sofort aus                   | Directus-Cookies nicht `Secure` über den HTTPS-Edge → `*_COOKIE_SECURE=true` + `SAME_SITE=lax` in `directus/.env`, Directus neu starten |

Quality Gates (Laptop, vor jedem Push): `corepack pnpm lint` / `typecheck` (0/0/0) /
`test` (62 grün) / `build` (39 Seiten) / Prettier sauber – alle grün. (e2e: 28/30, ein
vorbestehender `chromium-mobile`-Klick-Flake auf der Kritikenliste, nicht Teil des Laptop-Gates.)
