# POSTGRES_DRYRUN – joes-journal

**Stand:** 2026-05-29

## 1. Warum

Entwickelt wird lokal gegen **SQLite**, produktiv läuft **PostgreSQL 16**
([ARCHITECTURE.md](ARCHITECTURE.md)). SQLite ist bei einigen Dingen lax, die
Postgres strikt durchsetzt. Dieser Trockenlauf zieht **vor** dem VPS-Deployment
(Roadmap P9) den kompletten Pfad einmal gegen ein echtes Postgres durch und
fängt damit genau die Fehlerklasse ab, die sonst erst auf dem VPS auffällt:

- **FK-Strenge** – z. B. die `restaurant_reviews.restaurant`-Relation
  (vgl. [`restaurants.ts`](../directus/bootstrap/schema/restaurants.ts), Fix OPS-2:
  `on_delete: "NO ACTION"`). SQLite verzeiht eine `SET NULL`-auf-`NOT NULL`-Inkonsistenz,
  Postgres nicht.
- **JSON-Typen** – `tags`, `body`, `pours` etc. liegen in SQLite als TEXT, in
  Postgres als `json`. Directus' `cast-json`-Felder müssen sauber durchlaufen.
- **`decimal(2,1)`-Rating** – echtes `numeric` in PG vs. float in SQLite.
- **Schema-Reconciliation** (Fix OPS-1) – `schema:apply` legt fehlende Felder
  auf bestehenden Collections additiv an. Dieser Lauf prüft das gegen PG.
- **Editorial-Gate** (Fix SEC-1) – ein `draft`-Review in der DB darf **nicht**
  im Build landen.

> **Annahme:** Auf der Dev-Maschine ist PostgreSQL 16 installiert (oder portable)
> und `psql`/`pg_dump` sind erreichbar. Ist das nicht der Fall, zuerst PG 16
> lokal installieren — der Trockenlauf ist genau dazu da, das **nicht** zum
> ersten Mal auf dem VPS zu tun.

## 2. Automatischer Trockenlauf

Das Skript [`deploy/pg-dryrun.ps1`](../deploy/pg-dryrun.ps1) macht alles in §3
automatisch (eigene DB/Rolle, eigener Directus-Port `8056`, eigenes `.env`,
Assertions, Teardown — die normale Dev-SQLite-Umgebung bleibt unangetastet):

```powershell
# PG-Superuser-Passwort für das Anlegen von Rolle/DB:
$env:PGPASSWORD_SUPER = "<postgres-superuser-pw>"
C:\projekte\joes-journal\deploy\pg-dryrun.ps1 -PgBin "C:\Program Files\PostgreSQL\16\bin"
```

Erfolgskriterium: Das Skript endet mit `DRYRUN OK` und meldet
**8 Restaurants** und **3 Kritiken** über die Directus-API sowie einen grünen
`pnpm build` im Directus-Modus. Bei Fehlern bricht es ab und stellt das
ursprüngliche `directus/.env` wieder her.

## 3. Manueller Trockenlauf (autoritative Schritte)

Falls das Skript nicht passt oder etwas debuggt werden muss — exakt diese
Reihenfolge:

```powershell
# --- 3.1 Rolle + DB anlegen (als postgres-Superuser) ---
$env:PGPASSWORD = "<postgres-superuser-pw>"
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
& $psql -U postgres -h 127.0.0.1 -c "CREATE ROLE joes_journal_dryrun WITH LOGIN PASSWORD 'dryrun_local_only';"
& $psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE joes_journal_dryrun OWNER joes_journal_dryrun ENCODING 'UTF8' TEMPLATE template0;"

# --- 3.2 directus/.env auf Postgres umstellen (Dev-.env vorher sichern!) ---
cd C:\projekte\joes-journal\directus
Copy-Item .env .env.sqlite.bak -Force   # falls vorhanden
$envText = @'
HOST="127.0.0.1"
PORT="8056"
PUBLIC_URL="http://127.0.0.1:8056"
KEY="dryrun-key-not-for-production-0000000000000000"
SECRET="dryrun-secret-not-for-production"
DB_CLIENT="pg"
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_DATABASE="joes_journal_dryrun"
DB_USER="joes_journal_dryrun"
DB_PASSWORD="dryrun_local_only"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me-locally"
TELEMETRY="false"
'@
# BOM-frei schreiben (Set-Content -Encoding utf8 in PS 5.1 setzt ein BOM, das
# den ersten Key HOST unbrauchbar macht):
[System.IO.File]::WriteAllText("$PWD\.env", $envText, (New-Object System.Text.UTF8Encoding($false)))

# --- 3.3 Directus-Migrationen + Admin gegen PG ---
pnpm bootstrap

# --- 3.4 Directus starten (eigenes Terminal, laufen lassen) ---
pnpm start   # -> http://127.0.0.1:8056

# --- 3.5 Schema gegen PG anwenden  <-- hier zeigt sich OPS-2 (FK) ---
pnpm schema:apply     # 15 Collections + 1 Relation, KEIN FK-Fehler

# --- 3.6 Seed gegen PG ---
pnpm seed             # Mengen wie LOCAL_SETUP §3.4

# --- 3.7 OPS-1 verifizieren: Re-Apply ist idempotent + additiv ---
pnpm schema:apply     # zweiter Lauf: nichts Neues, keine Duplikat-Fehler

# --- 3.8 SEC-1 verifizieren: eine Kritik auf draft setzen ---
#   In Directus-Admin (http://127.0.0.1:8056/admin) eine Kritik -> status=draft.

# --- 3.9 Astro-Build im Directus-Modus gegen PG ---
cd C:\projekte\joes-journal
$env:JOES_DATA_SOURCE = "directus"
$env:JOES_DIRECTUS_URL = "http://127.0.0.1:8056"
$env:JOES_DIRECTUS_EMAIL = "admin@example.com"
$env:JOES_DIRECTUS_PASSWORD = "change-me-locally"
pnpm build
#   Erwartung: Build grün. Die auf draft gesetzte Kritik erzeugt KEINE Seite
#   unter dist/kritiken/<slug>/ und taucht nicht im Suchindex auf (SEC-1).
```

### 3.10 Teardown

```powershell
# Directus stoppen (Terminal aus 3.4), dann:
cd C:\projekte\joes-journal\directus
Copy-Item .env.sqlite.bak .env -Force       # Dev-SQLite-Umgebung wiederherstellen
$env:PGPASSWORD = "<postgres-superuser-pw>"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h 127.0.0.1 -c "DROP DATABASE joes_journal_dryrun;"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h 127.0.0.1 -c "DROP ROLE joes_journal_dryrun;"
```

## 4. Checkliste „grün vor VPS"

- [ ] `pnpm bootstrap` gegen PG ohne Fehler
- [ ] `pnpm schema:apply` gegen PG: 15 Collections + 1 Relation, **kein** FK-Fehler (OPS-2)
- [ ] zweiter `pnpm schema:apply`: idempotent, keine Duplikate (OPS-1)
- [ ] `pnpm seed`: 8 Restaurants, 3 Kritiken, Rest laut MVP_SCOPE §4
- [ ] `draft`-Kritik erzeugt **keine** Detailseite und keinen Suchtreffer (SEC-1)
- [ ] `pnpm build` (Directus-Modus, PG) grün (Stub baut 35 Seiten; mit Directus
      je nach Anzahl publizierter Inhalte ggf. weniger — eine Seite weniger pro
      nicht-publizierter Kritik)
- [ ] Teardown sauber: Dev-`.env` wiederhergestellt, Dryrun-DB/Rolle entfernt

Erst wenn diese Liste grün ist, an den VPS (siehe
[VPS_DEPLOYMENT_PLAN.md](VPS_DEPLOYMENT_PLAN.md)).
