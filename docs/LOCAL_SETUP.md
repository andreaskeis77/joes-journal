# LOCAL_SETUP – joes-journal

Runbook für die lokale Entwicklungsumgebung auf Windows.

**Stand:** 2026-05-17

## 1. Komponenten

| Komponente | Port | Lokale Konfig |
|---|---:|---|
| Astro Frontend | 4321 | Repo-Root (`pnpm dev`) |
| Directus Admin + API | 8055 | `directus/` (`pnpm start`) |
| Datenbank (Dev) | – | SQLite-Datei unter `directus/data/joes-journal.db` |
| Datenbank (Prod, später) | 5432 | PostgreSQL auf dem VPS |

## 2. Voraussetzungen

| Tool | Version | Hinweis |
|---|---|---|
| Node.js | 22.x LTS | Directus 11 ist **nicht** mit Node 24 kompatibel (native `isolated-vm` fehlt Prebuild). Empfohlen: Node 22 LTS via offiziellem Installer von [nodejs.org](https://nodejs.org). |
| pnpm | 9.x | Über Corepack: `corepack enable && corepack prepare pnpm@9.12.0 --activate` (Admin-Shell beim `enable`, sonst per `corepack pnpm <cmd>`) |
| Git | – | – |

## 3. Erstes Setup (einmalig)

### 3.1 Astro Frontend

```powershell
cd C:\projekte\joes-journal
pnpm install
pnpm typecheck
pnpm build
```

Akzeptanz:
- `pnpm typecheck` 0 Errors / 0 Warnings
- `pnpm build` erfolgreich

### 3.2 Directus + SQLite-Datenbank

```powershell
cd C:\projekte\joes-journal\directus

# .env aus Vorlage anlegen
copy .env.example .env

# Abhängigkeiten installieren (kompiliert native Module wie isolated-vm)
pnpm install

# SQLite-Datenbank initialisieren + Admin-User anlegen
mkdir data, uploads
pnpm bootstrap
```

Akzeptanz:
- Logs enden mit `Adding first admin user…` und `Done`.
- `directus/data/joes-journal.db` existiert.

### 3.3 Schema anwenden

```powershell
# Terminal 1: Directus starten und laufen lassen
pnpm start

# Terminal 2: Schema anwenden
pnpm schema:apply
```

Akzeptanz:
- 15 Collections angelegt:
  - 6 Taxonomien: `tax_cuisines`, `tax_locations`, `tax_tags`, `tax_ingredient_categories`, `tax_equipment_categories`, `tax_supplier_types`
  - 9 Inhalts-Collections: `restaurants`, `restaurant_reviews`, `recipes`, `cocktails`, `equipment`, `ingredients`, `suppliers`, `content_collections`, `links`
- 1 Relation: `restaurant_reviews.restaurant → restaurants`

### 3.4 Seed-Daten laden

```powershell
# Mit laufendem Directus (Terminal 1)
pnpm seed
```

Akzeptanz nach [MVP_SCOPE §4](MVP_SCOPE.md):

| Collection | Erwartete Anzahl |
|---|---:|
| restaurants | 8 |
| restaurant_reviews | 3 |
| recipes | 3 |
| cocktails | 3 (davon 1 alkoholfrei) |
| equipment | 4 (2 owned, 2 wishlist) |
| ingredients | 6 |
| suppliers | 3 |
| content_collections | 3 (2 manual, 1 saved_view) |
| links | 10 |
| tax_cuisines | ≥ 6 |
| tax_locations | ≥ 8 |
| tax_tags | ≥ 20 |
| tax_ingredient_categories | ≥ 5 |
| tax_equipment_categories | ≥ 3 |
| tax_supplier_types | ≥ 3 |

## 4. Tägliches Entwickeln

```powershell
# Terminal 1: Directus
cd C:\projekte\joes-journal\directus
pnpm start
# → http://127.0.0.1:8055

# Terminal 2: Astro
cd C:\projekte\joes-journal
pnpm dev
# → http://127.0.0.1:4321
```

## 5. Admin-Login

Aus `directus/.env`:

- E-Mail: `admin@example.com`
- Passwort: `change-me-locally`

Login: `http://127.0.0.1:8055/admin`

⚠️ Diese Defaults sind nur für **lokale** Entwicklung. Vor jedem nicht-lokalen Deployment in `directus/.env` neu setzen.

## 6. Daten zurücksetzen

```powershell
cd C:\projekte\joes-journal\directus
pnpm reset       # entfernt data/ und uploads/
mkdir data, uploads
pnpm bootstrap   # neuer Admin
pnpm schema:apply
pnpm seed
```

`pnpm reset` ist destruktiv und betrifft nur das lokale Verzeichnis.

## 7. Schema-Änderungen

Aktueller Workflow:

1. Felder/Collections in `directus/bootstrap/schema/*.ts` ergänzen oder anpassen.
2. `pnpm schema:apply` erneut ausführen (idempotent – legt nur Fehlendes neu an).
3. Für tiefere Änderungen (Spaltentypen, Renames): `pnpm reset` + Re-Bootstrap.

Snapshot exportieren (zur Übersicht oder für die VPS-Migration):

```powershell
pnpm schema:snapshot
# → directus/schema/snapshot.yaml
```

## 8. Switch auf PostgreSQL (später, für VPS)

In `directus/.env` den SQLite-Block ersetzen durch:

```env
DB_CLIENT="pg"
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_DATABASE="joes_journal"
DB_USER="joes_journal"
DB_PASSWORD="<secret>"
```

Schritte:

1. PostgreSQL 16 lokal/remote installieren, DB + User anlegen.
2. `pnpm bootstrap` läuft Directus-Migrationen gegen Postgres.
3. `pnpm schema:apply` legt die Domain-Collections an.
4. `pnpm seed` oder Migration der bestehenden Daten via Directus-Export/Import.

## 9. Bekannte Stolpersteine

| Problem | Lösung |
|---|---|
| `node-gyp` / `isolated-vm` Build-Fehler beim Install | Node ≥ 23 verwendet → wechsle zu Node 22 LTS. |
| `SQLITE_CANTOPEN` beim Bootstrap | `directus/data/` Ordner fehlt – `mkdir data` vor `pnpm bootstrap`. |
| `Validation failed for field "email"` beim Bootstrap | `ADMIN_EMAIL` in `.env` muss eine gültige TLD enthalten (`.local` wird abgelehnt). |
| Schema-Apply schlägt mit `Invalid foreign key` fehl | `meta.group` zeigt auf nicht existente Folder-Collection. Im Helper bereits unterdrückt. |
| Astro-Build findet `../../src/data/stub.ts` nicht | Im Astro-Build irrelevant – die Datei ist nur Seed-Quelle für `directus/bootstrap/seed.ts`. |

## 10. Verifikation per API

Quick-Check ohne Browser:

```powershell
$body = '{"email":"admin@example.com","password":"change-me-locally"}'
$r = Invoke-WebRequest "http://127.0.0.1:8055/auth/login" -Method POST `
     -ContentType "application/json" -Body $body -UseBasicParsing
$token = ($r.Content | ConvertFrom-Json).data.access_token

Invoke-WebRequest "http://127.0.0.1:8055/items/restaurants?fields=name,city,status" `
  -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing
```

Sollte 8 Restaurants liefern.
