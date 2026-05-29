# MIGRATION_E2 – Datenmodell relational (Phase E2)

**Stand:** 2026-05-29 · [ROADMAP_EXPANSION.md](ROADMAP_EXPANSION.md) §E2

Hebt das flache, denormalisierte Schema (Strings/JSON) schrittweise auf das
relationale Modell aus [DATA_MODEL.md](DATA_MODEL.md). **Es existieren Live-Daten
→ die Migrations-Grundregel aus ROADMAP_EXPANSION §0.3 gilt durchgehend:**
Backup vor jeder Schemaänderung, additiv zuerst, Typwechsel nur per
Migrationsskript + Verifikation, Restore-Drill vor riskanten Schritten.

> **Status:** Tooling gebaut & lint-grün; die slug-/Matching-Logik ist
> unit-getestet ([`src/lib/taxonomy/slug.test.ts`](../src/lib/taxonomy/slug.test.ts)).
> Die Schema-/Migrationsskripte sind **noch nicht gegen eine laufende Directus-
> Instanz verifiziert** – deshalb dieser Runbook und die Pflicht, sie **zuerst
> auf einer Restore-Drill-Kopie** auszuführen, nicht direkt live.

## Was E2 additiv anlegt (Tranche E2.1 + E2.2)

[`directus/bootstrap/schema/taxonomy-relations.ts`](../directus/bootstrap/schema/taxonomy-relations.ts):

- M2M `restaurants` ↔ `tax_cuisines` (Junction `restaurants_cuisines`, Alias
  `cuisine_terms`)
- M2M `restaurants` ↔ `tax_tags` (Junction `restaurants_tags`, Alias `tag_terms`)
- M2O `restaurants.location_term` → `tax_locations`

Die bestehenden Spalten `cuisine`, `tags`, `city`, `region` **bleiben** als
Fallback erhalten. Nichts Bestehendes wird verändert oder gelöscht.

## Ablauf

### 1. Quality Gates (Laptop)

```powershell
corepack pnpm test        # u.a. slug.test.ts grün
corepack pnpm lint
```

### 2. Backup (VPS, Administrator-PowerShell)

```powershell
$ts = Get-Date -Format yyyyMMdd-HHmmss
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U postgres -h 127.0.0.1 -F c `
  -f "C:\joes-journal\backups\joes_journal-pre-e2-$ts.dump" joes_journal
```

### 3. Restore-Drill (Pflicht vor Live, schließt zugleich P11)

Backup in eine **Test-DB** einspielen und die Migration dort zuerst fahren –
Vorgehen wie in [POSTGRES_DRYRUN.md](POSTGRES_DRYRUN.md) (isolierte DB/Rolle/Port).
Erst wenn Drill + Verifikation (§4) dort sauber sind, gegen die Live-DB.

### 4. Migration ausführen

```powershell
cd C:\joes-journal\repo\directus
corepack pnpm run relations:apply      # additive Strukturen (Junctions/Alias/M2O)
corepack pnpm run migrate:taxonomies   # Freitext -> Terme + Verknüpfungen
```

`migrate:taxonomies` ist **idempotent**: Terme/Links/`location_term` werden nur
angelegt bzw. gesetzt, wenn sie fehlen. Ein zweiter Lauf erzeugt `+0`.

### 5. Verifikation (Counts vor/nach)

```sql
-- Erwartung: pro Restaurant >= 1 Küchen-Term, Tag-Links = Summe der Tags,
-- location_term gesetzt wo city vorhanden.
SELECT count(*) FROM restaurants_cuisines;
SELECT count(*) FROM restaurants_tags;
SELECT count(*) FROM restaurants WHERE location_term IS NOT NULL;
-- Stichprobe:
SELECT r.slug, c.name FROM restaurants r
  JOIN restaurants_cuisines rc ON rc.restaurants_id = r.id
  JOIN tax_cuisines c ON c.id = rc.tax_cuisines_id
  ORDER BY r.slug;
```

Im Admin: Restaurant öffnen → `cuisine_terms` / `tag_terms` zeigen die
verknüpften Terme; `location_term` ist gesetzt.

### 6. Frontend-Cutover (E2.5, SEPARATE Tranche – erst nach erfolgreicher Migration)

Bewusst getrennt, damit die Live-Site während der Datenmigration unverändert
weiterläuft (sie liest weiterhin die Freitext-Spalten):

1. Loader (`fetchAllRaw`) zusätzlich `cuisine_terms`/`tag_terms`/`location_term`
   laden; Mapper befüllen neue Felder, **fallen auf die Strings zurück**, wenn
   leer (analog zum Bake-Fallback in E1.3).
2. Restaurantliste-Filter (`/restaurants`) an die Term-Slugs binden (kontrollierte
   Facetten statt String-Vergleich).
3. Quality Gates + Smoke. Erst danach die alten String-Spalten als „deprecated"
   markieren (nicht löschen, bis mehrere Builds stabil sind).

## Noch offen in E2 (geplant, nicht gebaut)

- **E2.3 Links als M2A** (statt `*_slug`-Strings) – DATA_MODEL §10; Many-to-Any
  zuerst auf einer Drill-Kopie testen.
- **E2.4 reichere Felder** (Kritik: `summary`, `visit_type`, `occasion`,
  `seo_*`; Restaurant: `address`, `country`, `short_note`) – additive Feld-Adds.
- **E2.5 Frontend-Filter** an echte Taxonomien (siehe §6).

## Rollback

`relations:apply` ist additiv → im Zweifel die Junction-Collections +
Alias-/M2O-Felder im Admin wieder entfernen. Bei Datenfehlern: das pre-E2-Dump
aus §2 zurückspielen (Restore wie in [DEPLOY_STATE.md §7](DEPLOY_STATE.md)).
