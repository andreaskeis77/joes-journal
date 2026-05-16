# ROADMAP – joes-journal

## 1. Ziel

Diese Roadmap ist für eine agentenunterstützte Umsetzung mit Claude/AI-Coding gedacht.

Sie zerlegt das Projekt in kleine, testbare Tranchen. Jede Tranche soll autonom bearbeitbar sein, aber nur innerhalb klarer Grenzen.

## 2. Arbeitsprinzipien für Agenten

Jeder Agent muss vor Umsetzung lesen:

1. `docs/PROJECT_CHARTER.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DATA_MODEL.md`
4. `docs/MVP_SCOPE.md`
5. für UI-Arbeiten zusätzlich:
   - `docs/DESIGN_TOKENS.md`
   - `docs/FRONTEND_UX_SPEC.md`
6. für Directus:
   - `docs/DIRECTUS_ADMIN_UX.md`
7. für Deploy:
   - `docs/VPS_DEPLOYMENT_PLAN.md`
   - `docs/SECURITY_PRIVACY.md`

## 3. Agentenregeln

- Kein Agent arbeitet ohne klaren Tranche-Scope.
- Keine Secrets erzeugen oder committen.
- Keine Architekturänderung ohne Doku-Update.
- Keine Schemaänderung ohne Schema-Snapshot/Migration und Test.
- Keine großen Sammelrefactorings.
- Nach jeder Tranche Tests ausführen.
- Wenn Tests rot sind: stoppen, nicht weiterbauen.
- Jede Tranche enthält Akzeptanzkriterien.
- Jede Tranche aktualisiert relevante Dokumentation.

## 4. Phasenübersicht

| Phase | Ziel |
|---|---|
| P0 | Repo-Bootstrap und Methodik |
| P1 | Directus/PostgreSQL lokales Grundsetup |
| P2 | Datenmodell und Schema-Snapshots |
| P3 | Seed-/Testdaten |
| P4 | Astro Frontend Grundgerüst |
| P5 | Restaurant/Kritik MVP |
| P6 | Rezepte, Cocktails, Geräte, Links, Sammlungen |
| P7 | Suche, Filter, Statistik |
| P8 | UX-Smokes, Accessibility, Mobile |
| P9 | Native Windows VPS Deployment |
| P10 | Private Cloudflare Access Freigabe |
| P11 | Hardening, Backup, Restore |
| P12 | Spätere Erweiterungen |

## 5. P0 – Repo-Bootstrap

### T0.1 – Initial Repository

Scope:

- pnpm Workspace
- Astro App
- Directus Konfigurationsbereich
- docs einchecken
- `.env.example`
- README
- Basis-Skripte

Tests:

- `pnpm install`
- `pnpm build`
- Dokumente vorhanden

Akzeptanz:

- Repo kann auf DEV-LAPTOP geklont und installiert werden.

### T0.2 – Tooling Baseline

Scope:

- ESLint
- Prettier
- TypeScript strict
- Basis-Testframework
- Scripts:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`

Akzeptanz:

- alle Basisskripte laufen grün.

## 6. P1 – Local Directus/PostgreSQL

### T1.1 – PostgreSQL Local Setup Guide

Scope:

- lokale DB-Konfiguration
- `.env.example`
- Setup-Doku
- Verbindungsprüfung

Akzeptanz:

- DB lokal erreichbar.

### T1.2 – Directus Bootstrap

Scope:

- Directus lokal starten
- Admin User
- Basis-Konfiguration
- Health Check

Akzeptanz:

- Directus Admin lokal erreichbar.

## 7. P2 – Datenmodell und Schema

### T2.1 – Taxonomies

Scope:

- tax_cuisines
- tax_locations
- tax_tags
- tax_ingredient_categories
- tax_equipment_categories
- tax_supplier_types

Tests:

- Schema-Snapshot vorhanden
- Seed-Begriffe ladbar

### T2.2 – Restaurants + Reviews

Scope:

- restaurants
- restaurant_reviews
- Beziehung Restaurant → Reviews
- 5-Sterne-Bewertung
- Statuswerte

Tests:

- Restaurant ohne Kritik möglich
- Restaurant mit Kritik möglich
- Rating 1–5 validiert

### T2.3 – Links + Collections

Scope:

- links
- collections
- manual_collection
- saved_view
- Link-Verknüpfung via Many-to-Any oder Junction

Tests:

- Link kann Restaurant zugeordnet werden
- Collection kann Restaurant enthalten

### T2.4 – Recipes, Cocktails, Ingredients, Suppliers, Equipment

Scope:

- restliche Collections
- Kernrelationen
- Statuswerte

Tests:

- Testdaten ladbar
- Relationen funktionieren

## 8. P3 – Seed/Testdaten

### T3.1 – Realistische Seed-Daten

Scope:

- 8 Restaurants
- 3 Kritiken
- 3 Rezepte
- 3 Cocktails
- 6 Zutaten
- 3 Lieferanten
- 4 Geräte
- 10 Links
- 3 Sammlungen

Akzeptanz:

- Frontend kann mit realistischen Daten entwickelt werden.

## 9. P4 – Astro Frontend Baseline

### T4.1 – Layout Shell

Scope:

- Header
- Mobile Drawer
- Footer
- Basislayout
- Design Tokens

Tests:

- Build grün
- Mobile Drawer Smoke

### T4.2 – Directus Data Client

Scope:

- API Client
- typed fetch functions
- Fehlerhandling

Tests:

- Mock-Fetch Tests
- Build grün

## 10. P5 – Restaurant/Kritik MVP

### T5.1 – Startseite

Scope:

- Hero
- globale Suche UI
- neueste Kritiken
- Watchlist-Teaser
- Statistik-Karten

Tests:

- Startseite rendert Testdaten.

### T5.2 – Restaurantliste

Scope:

- Cards
- Statusbadges
- Filter
- Suche
- mobile Filterdrawer

Tests:

- Watchlist-Filter
- Stadt/Region-Filter
- Mobile Smoke

### T5.3 – Restaurantdetail

Scope:

- Stammdaten
- Links
- Status
- Kritikenliste
- Empty State ohne Kritik

Tests:

- Restaurant mit Kritik
- Restaurant ohne Kritik

### T5.4 – Kritikdetail

Scope:

- Hero
- Sterne prominent
- Artikeltext
- Galerie
- Metadaten

Tests:

- Rating sichtbar
- Restaurantrelation sichtbar

## 11. P6 – Erweiterte Inhalte

### T6.1 – Rezepte

- Liste
- Detail
- Zutaten/Schritte
- Gerätebezug

### T6.2 – Cocktails

- Liste
- Detail
- Technik, Glas, Rezeptur
- alkoholfrei/alkoholisch

### T6.3 – Geräte

- Liste
- Detail
- Status/Wunschliste
- Links

### T6.4 – Sammlungen

- manual_collection
- saved_view MVP-Auswertung
- Sammlungsdetail

## 12. P7 – Suche, Filter, Statistik

### T7.1 – Globale Suche MVP

Scope:

- Suche über Kern-Collections
- Ergebnisgruppen

Tests:

- Suche findet Restaurant
- Suche findet Kritik
- Suche findet Cocktail

### T7.2 – Statistik MVP

Scope:

- Restaurants insgesamt
- Restaurants besucht
- Restaurants auf Watchlist
- Top-Städte/Regionen

Tests:

- Zählung mit Testdaten korrekt

## 13. P8 – UX, Accessibility, Mobile

### T8.1 – Responsive Audit

- Smartphone
- Tablet
- Laptop
- kritische Layouts

### T8.2 – Accessibility Smoke

- Fokuszustände
- Überschriften
- Kontrast
- Form Controls
- Rating nicht nur visuell

### T8.3 – Playwright Critical Flows

Flows:

- Startseite lädt
- mobile Navigation öffnet
- Restaurant-Watchlist filtern
- Kritikdetail öffnen
- Suche ausführen

## 14. P9 – Native Windows VPS Deployment

### T9.1 – VPS Install Runbook

- Node.js LTS
- pnpm
- PostgreSQL
- Directus
- Astro
- Pfade
- Services

### T9.2 – Deployment Scripts

- pull
- install
- build
- restart
- smoke

### T9.3 – Service Setup

- Directus Service
- Astro Service oder statische Auslieferung
- Logs

## 15. P10 – Cloudflare Access

### T10.1 – Tunnel Routes

- `zumfettigenjoe.com`
- `admin.zumfettigenjoe.com`

### T10.2 – Access Policies

- Frontend privat
- Admin privat
- Tests

## 16. P11 – Backup und Restore

### T11.1 – Backup

- PostgreSQL Dump
- Directus Uploads
- Config

### T11.2 – Restore Drill

- Restore in Testordner
- DB Start
- Directus liest Restore
- Astro liest Restore

## 17. P12 – spätere Erweiterungen

- selektiv öffentliche Seiten
- Pagefind/Meilisearch
- Karte/Geo-Ansicht
- bessere Rezeptstruktur
- semantische Suche
- öffentliche SEO-Optimierung
- Logo/Wortmarke final
- externe Backup-Kopie
- Docker/Compose Neubewertung

## 18. Roadmap-Gates

Vor jeder Phase:

- Scope prüfen
- Doku lesen
- Akzeptanzkriterien festlegen

Nach jeder Tranche:

```powershell
git status --short
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Bei UI-Tranchen später zusätzlich:

```powershell
pnpm test:e2e
```

Bei Deployment-Tranchen zusätzlich:

- Service Status
- Health Checks
- Cloudflare Zugriff
- Backup/Restore Smoke

## 19. Was zuerst gebaut wird

Empfohlene konkrete Reihenfolge:

1. Repo Bootstrap
2. Tooling Baseline
3. Directus/PostgreSQL lokal
4. Taxonomie-Collections
5. Restaurants + Reviews
6. Seed-Daten
7. Astro Shell
8. Startseite
9. Restaurantliste
10. Restaurantdetail
11. Kritikdetail
12. Suche/Filter
13. Statistik
14. VPS-Deployment
