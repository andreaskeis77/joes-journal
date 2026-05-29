# joes-journal – Planungsdokumente

**Projekt:** `joes-journal`  
**Website:** Zum Fettigen Joe  
**Subline:** Ein persönliches Journal über Restaurants, Küche, Cocktails und guten Geschmack.  
**Signatur:** powered by umami  
**Stand:** 2026-05-16

## Dokumentenübersicht

| Dokument                     | Zweck                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `PROJECT_CHARTER.md`         | Projektauftrag, Ziele, Leitentscheidungen, Scope-Rahmen                         |
| `ARCHITECTURE.md`            | Zielarchitektur Directus + PostgreSQL + Astro + Windows-VPS                     |
| `DATA_MODEL.md`              | Directus Collections, Relationen, Taxonomie/Ontologie, Bewertungsmodell         |
| `DIRECTUS_ADMIN_UX.md`       | Redaktionsmodus, Collection-Layouts, Workflows, Admin-Dashboards                |
| `design/DESIGN_TOKENS.md`    | Farben, Typografie, Spacing, Breakpoints, UI-Tokens                             |
| `design/FRONTEND_UX_SPEC.md` | Frontend-Seiten, Navigation, Suche, Filter, mobile/desktop UX                   |
| `VPS_DEPLOYMENT_PLAN.md`     | Native Windows MVP, Pfade, Dienste, Domains, Backup, Deployment                 |
| `DEPLOY_STATE.md`            | Realer VPS-Betriebszustand + Runbook (Live-Inbetriebnahme P9/P10)               |
| `ADMIN_ACCESS.md`            | Directus-Admin hinter Cloudflare Access + Dauerbetrieb (E1.1, VPS-Runbook)      |
| `CONTENT_REBUILD.md`         | SSG-Staleness: wie Directus-Inhalte ins statische Frontend kommen               |
| `MEDIA_BAKE.md`              | Bild-Upload via Directus Files + Build-Zeit-Bake nach `public/_uploads/` (E1.3) |
| `POSTGRES_DRYRUN.md`         | Lokaler Postgres-Trockenlauf vor dem VPS (Schema/Seed/Build gegen PG)           |
| `SECURITY_PRIVACY.md`        | Private-first Betrieb, Cloudflare Access, Tailscale, Bildrechte, Secrets        |
| `MVP_SCOPE.md`               | MVP 0.1: Was wird gebaut, was nicht                                             |
| `ROADMAP.md`                 | Agentenfähige Umsetzungsroadmap mit Tests und Quality Gates                     |
| `ROADMAP_EXPANSION.md`       | Post-MVP-Ausbau E1–E4 (Editorial, Schema, Inhalte, Öffentlich)                  |

## Verbindliche Leitentscheidungen

- **Projektname / Repo:** `joes-journal`
- **DEV-LAPTOP Pfad:** `C:\projekte\joes-journal`
- **VPS Pfad:** `C:\joes-journal`
- **Frontend Domain:** `https://zumfettigenjoe.com`
- **Directus Admin Domain:** `https://admin.zumfettigenjoe.com`
- **Betriebsmodell MVP:** Native Windows, Docker später neu bewerten
- **Sichtbarkeit MVP:** privat via Cloudflare Access, später selektiv öffentlich
- **Bewertung:** 5 Sterne wie Tripadvisor, keine Subscores, prominent sichtbar
- **Suche MVP:** Directus/PostgreSQL-basierte Suche + Filter
- **Frontend:** Astro + TypeScript
- **Package Manager:** pnpm
- **Admin/CMS:** Directus
- **DB:** PostgreSQL
- **Typography MVP:** Headlines Poppins, Body/UI Inter
- **Tracking:** kein Tracking im MVP
