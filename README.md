# joes-journal

Private Gastro-Plattform für **Zum Fettigen Joe** – ein persönliches Journal über Restaurants, Küche, Cocktails und guten Geschmack. _powered by umami_.

## Stack

- **Frontend:** Astro 5 + TypeScript, static SSG
- **Backend:** Directus 11 + SQLite (Dev) / PostgreSQL (Prod auf VPS)
- **Tests:** Vitest (Unit) + Playwright (E2E) + axe-core (a11y)
- **Toolchain:** pnpm 9, ESLint 9 Flat Config, Prettier 3
- **Deployment-Ziel:** Windows VPS hinter Cloudflare Access

Vollständige Architektur: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · Zielfunktionen: [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md).

## Schnellstart

```powershell
# Astro Frontend (kein Backend nötig — läuft mit Stub-Daten)
pnpm install
pnpm dev                          # → http://127.0.0.1:4321
```

Mit echter Directus-Datenquelle ([docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) für Details):

```powershell
cd directus
copy .env.example .env
pnpm install
mkdir data, uploads
pnpm bootstrap                    # Directus + SQLite + Admin
pnpm start                        # Terminal 1 — http://127.0.0.1:8055

# Terminal 2: Schema + Seed
pnpm schema:apply
pnpm seed

# Terminal 3: Astro gegen Directus
$env:JOES_DATA_SOURCE = "directus"
$env:JOES_DIRECTUS_EMAIL = "admin@example.com"
$env:JOES_DIRECTUS_PASSWORD = "change-me-locally"
pnpm dev
```

> **Hinweis:** Directus 11 erfordert Node 20/22 LTS; das Astro-Frontend läuft auch auf Node 24. Wenn du beides parallel betreibst, dokumentiert [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) den portablen Node-22-Pfad für Directus.

## Befehle

Alle aus dem Repo-Root:

| Command                             | Was es macht                                                           |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                          | Astro Dev-Server (Stub-Daten oder Directus je nach `JOES_DATA_SOURCE`) |
| `pnpm build`                        | Astro Production-Build → `dist/`                                       |
| `pnpm preview`                      | dient `dist/` aus auf Port 4321                                        |
| `pnpm typecheck`                    | `astro check`                                                          |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                                 |
| `pnpm format` / `pnpm format:check` | Prettier                                                               |
| `pnpm test`                         | Vitest Unit-Tests (Mapper + Derive-Logik)                              |
| `pnpm test:e2e`                     | Playwright E2E inkl. axe-A11y                                          |
| `pnpm test:e2e:install`             | Chromium für Playwright herunterladen                                  |

Im `directus/` Workspace:

| Command                | Was es macht                                 |
| ---------------------- | -------------------------------------------- |
| `pnpm bootstrap`       | DB + Admin anlegen                           |
| `pnpm start`           | Directus API + Admin starten                 |
| `pnpm schema:apply`    | Domain-Schema via SDK applizieren            |
| `pnpm seed`            | Testdaten aus `src/data/stub.ts` importieren |
| `pnpm schema:snapshot` | YAML-Snapshot exportieren                    |
| `pnpm reset`           | `data/` + `uploads/` löschen (destruktiv)    |

## Repo-Struktur

```text
joes-journal/
├── src/
│   ├── components/         Astro-Komponenten (Cards, Header, Drawer)
│   ├── data/               Stub-Daten, Source-Toggle, Pure-Derivation
│   ├── layouts/            BaseLayout
│   ├── lib/directus/       Read-only Directus-Client + Mapper
│   ├── pages/              Astro-Routen
│   └── styles/             Design-Tokens + globale Styles
├── public/                 Asset-Library (151 Files, akzeptiert)
├── directus/               Directus-Subpackage (Schema, Seed, Bootstrap)
├── docs/                   Architektur, MVP-Scope, Roadmap, Design-Tokens
├── docs/design/            Asset-Spezifikation + Frontend-UX-Spec
├── tests/e2e/              Playwright + axe-Smokes
└── tools/asset_factory/    Python-Tooling für Asset-Generierung
```

## Datenquellen-Toggle

Astro liest aus zwei Quellen, gesteuert per `JOES_DATA_SOURCE`:

```env
JOES_DATA_SOURCE=stub        # Default: src/data/stub.ts, kein Backend nötig
JOES_DATA_SOURCE=directus    # Live-Fetch von der lokalen Directus-Instanz
```

Beide produzieren denselben Bundle-Shape via `src/data/source.ts` → die Components sehen keinen Unterschied. Komplette Konfiguration: [`.env.example`](.env.example).

## Quality Gates

Vor jedem Commit sollten grün sein:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Vor jedem Merge auf `main` zusätzlich:

```powershell
pnpm test:e2e
```

## Dokumentation

| Datei                                                              | Zweck                                          |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| [docs/PROJECT_CHARTER.md](docs/PROJECT_CHARTER.md)                 | Projektauftrag, Markenlogik, Ziele             |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                       | Ziel-Architektur Directus + Astro + Cloudflare |
| [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md)                             | Was im MVP 0.1 gebaut wird                     |
| [docs/ROADMAP.md](docs/ROADMAP.md)                                 | Phasen P0–P12 mit Tranchen                     |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md)                           | Directus Collections und Relationen            |
| [docs/DIRECTUS_ADMIN_UX.md](docs/DIRECTUS_ADMIN_UX.md)             | Redaktionsmodus, Workflows                     |
| [docs/SECURITY_PRIVACY.md](docs/SECURITY_PRIVACY.md)               | Private-first Betrieb                          |
| [docs/VPS_DEPLOYMENT_PLAN.md](docs/VPS_DEPLOYMENT_PLAN.md)         | Native Windows VPS Setup                       |
| [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md)                         | Lokales Setup-Runbook                          |
| [docs/design/DESIGN_TOKENS.md](docs/design/DESIGN_TOKENS.md)       | Farben, Typografie, Spacing                    |
| [docs/design/FRONTEND_UX_SPEC.md](docs/design/FRONTEND_UX_SPEC.md) | Seiten, Navigation, mobile/desktop UX          |
| [docs/design/ASSET_LIBRARY.md](docs/design/ASSET_LIBRARY.md)       | Visuelle Asset-Bibliothek                      |

## Markenlogik

```text
Joe   = Charakter, Wärme, Essen, Haltung, persönlicher Blick
umami = Kompetenz, Qualität, Ruhe, kulinarische Ernsthaftigkeit
```

Subline: _Ein persönliches Journal über Restaurants, Küche, Cocktails und guten Geschmack._

Signatur: _powered by umami._
