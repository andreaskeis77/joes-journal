# joes-journal – Planungsdokumente

**Projekt:** `joes-journal`  
**Website:** Zum Fettigen Joe  
**Subline:** Ein persönliches Journal über Restaurants, Küche, Cocktails und guten Geschmack.  
**Signatur:** powered by umami  
**Stand:** 2026-05-16

## Dokumentenübersicht

| Dokument                     | Zweck                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| `PROJECT_CHARTER.md`         | Projektauftrag, Ziele, Leitentscheidungen, Scope-Rahmen                  |
| `ARCHITECTURE.md`            | Zielarchitektur Directus + PostgreSQL + Astro + Windows-VPS              |
| `DATA_MODEL.md`              | Directus Collections, Relationen, Taxonomie/Ontologie, Bewertungsmodell  |
| `DIRECTUS_ADMIN_UX.md`       | Redaktionsmodus, Collection-Layouts, Workflows, Admin-Dashboards         |
| `design/DESIGN_TOKENS.md`    | Farben, Typografie, Spacing, Breakpoints, UI-Tokens                      |
| `design/FRONTEND_UX_SPEC.md` | Frontend-Seiten, Navigation, Suche, Filter, mobile/desktop UX            |
| `VPS_DEPLOYMENT_PLAN.md`     | Native Windows MVP, Pfade, Dienste, Domains, Backup, Deployment          |
| `DEPLOY_STATE.md`            | Realer VPS-Betriebszustand + Runbook (Live-Inbetriebnahme P9/P10)        |
| `CONTENT_REBUILD.md`         | SSG-Staleness: wie Directus-Inhalte ins statische Frontend kommen        |
| `POSTGRES_DRYRUN.md`         | Lokaler Postgres-Trockenlauf vor dem VPS (Schema/Seed/Build gegen PG)    |
| `SECURITY_PRIVACY.md`        | Private-first Betrieb, Cloudflare Access, Tailscale, Bildrechte, Secrets |
| `MVP_SCOPE.md`               | MVP 0.1: Was wird gebaut, was nicht                                      |
| `ROADMAP.md`                 | Agentenfähige Umsetzungsroadmap mit Tests und Quality Gates              |

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
