# ROADMAP_EXPANSION – joes-journal (Post-MVP, Phasen E1–E4)

**Stand:** 2026-05-29 · Schließt an [ROADMAP.md](ROADMAP.md) P12 an. Ergänzt um die
real vorgefundene Lage aus [DEPLOY_STATE.md](DEPLOY_STATE.md).

## 0. Ausgangslage & Leitplanken

**Ist-Zustand:** MVP 0.1 läuft live & privat (`zumfettigenjoe.com` hinter Cloudflare
Access). Es ist bewusst eine **dünne** Umsetzung des Konzepts:

- Frontend = statisches Astro (`dist/`), von IIS ausgeliefert; Daten zur Build-Zeit aus Directus.
- Schema ist **flach/denormalisiert** (Strings/JSON statt Relationen), Bilder sind **Pfad-Strings**
  (kein Upload), Taxonomien existieren, sind aber **verwaist** (kein Inhalt referenziert sie).
- Editorial-Status-Gate (SEC-1) ist aktiv: nur `published` erreicht den Output → Entwürfe bleiben privat.

**Diese Drift zum [DATA_MODEL.md](DATA_MODEL.md) ist die zentrale technische Schuld**, die der
Ausbau abträgt. Reihenfolge: erst Redaktion bedienbar machen (E1), dann Modell relational (E2),
dann neue Inhalte/Discovery (E3), dann öffentlich/Feinschliff (E4).

**Verbindliche Leitplanken (für jede Tranche, [PROJECT_CHARTER.md](PROJECT_CHARTER.md) §9):**

1. Eine Tranche = klarer Scope + Akzeptanzkriterien + Tests; nach jeder Tranche Quality Gates.
2. Keine Secrets im Repo. Keine zwei Architekturachsen gleichzeitig ändern.
3. **Migrations-Grundregel** (gilt für alle Schema-Tranchen, weil **Live-Daten** existieren):
   - **Backup vor jeder Schemaänderung** (`pg_dump`, siehe DEPLOY_STATE §7).
   - **Additiv zuerst:** neue Felder/Collections via `schema:apply` (OPS-1 reconciliert additiv).
   - **Typwechsel** (z. B. String → Relation) brauchen ein **Migrationsskript** (alte Werte → neue
     Struktur) + Verifikation; das alte Feld erst nach erfolgreicher Migration entfernen.
   - **Restore-Drill** vor riskanten Migrationen (schließt zugleich P11).
4. Quelle der Wahrheit ist diese Doku, nicht der Chatverlauf.

---

## 1. Phase E1 – Editorial Enablement

> Ziel: Andreas legt Kritiken/Rezepte/Cocktails **mit Fotos** an und sieht sie **live**, ohne den
> VPS anzufassen. Das macht Directus vom „rohen DB-Frontend" zum Redaktionsstudio.

### E1.1 – Admin hinter Cloudflare Access (`admin.zumfettigenjoe.com`)

Scope:

- Cloudflare Access-App `admin.zumfettigenjoe.com` (Allow nur Owner-E-Mail).
- Public Hostname auf Tunnel `Contabo-Wardrobe`: `admin.zumfettigenjoe.com` → HTTP → **`127.0.0.1:8055`**
  (nicht `localhost` — IPv4-Caveat aus DEPLOY_STATE §10).
- Directus `.env`: `PUBLIC_URL=https://admin.zumfettigenjoe.com`, CORS prüfen; Directus neu starten.
- Directus von On-Demand-Task auf **Dauerbetrieb** umstellen (NSSM-Dienst **oder** Task „beim Start,
  neu starten bei Absturz"), da Admin jederzeit erreichbar sein muss.

Akzeptanz: Login über `admin.zumfettigenjoe.com` → Cloudflare-Access → Directus-Login → Admin nutzbar;
8055 bleibt nur loopback; Directus überlebt Neustart.

### E1.2 – Auto-Rebuild (Save → Live)

Scope:

- Directus **Flow**: Event Hook auf `items.create/update/delete` der Content-Collections →
  Operation „Webhook / Request URL" → ruft lokalen Rebuild-Endpunkt (`127.0.0.1`, loopback-only).
- Kleiner **Rebuild-Listener** (Node/PowerShell) als Dienst: empfängt den Hook, **debounced**
  (z. B. 60 s Sammelfenster), startet `deploy/rebuild.ps1`. Shared-Secret-Header gegen Fremdaufrufe.
- Fallback/Backstop: nächtlicher `JoesJournal-Rebuild`-Task (SYSTEM), siehe [CONTENT_REBUILD.md](CONTENT_REBUILD.md).

Akzeptanz: Kritik in Directus auf `published` setzen → in ≤ ~2 Min ohne manuellen Eingriff auf der
Website; mehrere Speichervorgänge lösen **einen** Build aus (Debounce); Listener nicht öffentlich.

### E1.3 – Directus Files (Bild-Upload) + statische Auflösung

Scope:

- Directus Files aktiv (lokaler Storage unter `directus/uploads/`, schon vorhanden).
- Content-Bildfelder **additiv** um File-Referenzen ergänzen (m2o → `directus_files`), Pfad-String-Felder
  bleiben vorerst als Fallback.
- **Build-Zeit-„Bake":** Der Loader lädt referenzierte Directus-Files herunter und schreibt sie nach
  `dist/` (lokale URL), statt zur Laufzeit von Directus zu laden. _Begründung:_ Frontend ist statisch
  und Directus liegt hinter Access — Laufzeit-`/assets/<id>` wäre auth-geschützt → Bilder kaputt.
  Bake hält alles statisch + privat.
- Asset-Strategie festlegen: kuratierte Design-Assets bleiben in `public/assets/`; **hochgeladene
  Fotos** kommen über Directus Files + Bake. Hybrid.

Akzeptanz: Foto in Directus hochladen → erscheint nach Rebuild auf der Seite als lokales Asset in
`dist/`; kein Laufzeit-Call zu Directus; `DIRECTUS_ADMIN_UX.md` §13 „Fotos einfach hochladen" erfüllt.

### E1.4 – Admin-UX-Politur ([DIRECTUS_ADMIN_UX.md](DIRECTUS_ADMIN_UX.md))

Scope (über `schema/*.ts`-Meta + Directus-Settings):

- Feld-**Tabs/Gruppen** je Collection (Allgemein / Ort & Küche / Links / Medien / Kritiken / Notizen …).
- **Gespeicherte Filter** je Liste (Entwürfe, Veröffentlicht, Ohne Bild, Hohe Priorität, Berlin …).
- **Display-Templates** (Restaurant `{{name}} · {{city}} · {{status}}`, Kritik `{{title}} · {{rating}}★`).
- **Dashboard** (Insights): Restaurants total/besucht/Watchlist, Top-Städte, letzte Kritiken, ohne Kritik, Geräte-Wunschliste.
- Pflichtfelder sparsam, Slug-Auto-Generierung, Hilfetexte.

Akzeptanz ([DIRECTUS_ADMIN_UX.md](DIRECTUS_ADMIN_UX.md) §13): neues Restaurant < 2 Min; Kritik mit
Relation intuitiv; nützliche Filter; keine Collection wirkt wie rohe SQL-Tabelle.

**Tests E1 (gesamt):** `rebuild.ps1` läuft headless grün; Smoke `zumfettigenjoe.com` + `admin.…`;
Bild-Upload→Bake verifiziert; bestehende Quality Gates (lint/typecheck/test/build) grün.

---

## 2. Phase E2 – Datenmodell auf Konzept heben

> Ziel: Filter, saubere Statistik und „kein Wildwuchs" — die Kernversprechen von DATA_MODEL.md —
> tragen erst, wenn das Modell relational ist. **Migrations-Grundregel (§0.3) gilt durchgehend.**

- **E2.1 Taxonomie-Relationen:** `restaurants.location/region` → `tax_locations` (M2O/M2M),
  `restaurants.cuisines` → `tax_cuisines` (M2M). Migrationsskript: bestehende Freitext-Strings →
  Taxonomie-Terme matchen/anlegen. Frontend-Mapper + Filter nachziehen.
- **E2.2 Tags M2M:** `tags` (JSON) → `tax_tags` (M2M, mit `scope`). Migration der JSON-Werte.
- **E2.3 Links als echte Verknüpfungen:** `links` per Many-to-Any / Junction mit Inhalten verbinden
  (statt `*_slug`-Strings). Many-to-Any zuerst testen (DATA_MODEL §10).
- **E2.4 Reichere Felder:** Kritik um `summary`, `visit_type`, `occasion`, `seo_title/description`;
  Restaurant um `address`, `country`, `short_note` vs. `description`. Frontend-Detailseiten erweitern.
- **E2.5 Frontend-Filter** an echte Taxonomien binden (Restaurantliste: Stadt/Region/Küche/Preis/Prio
  als kontrollierte Facetten statt String-Vergleich).

**Tests E2 (je Tranche):** Migrationsskript idempotent + verifiziert (Counts vor/nach); Backup +
Restore-Drill vor Typwechseln; Build im Directus-Modus grün; Filter liefern erwartete Mengen.

---

## 3. Phase E3 – Inhalte & Discovery

- **E3.1 Journal-Artikel-Typ** _(vom User gewünscht — freie Beiträge zusätzlich zu den bestehenden Typen)_:
  Neue Collection `articles` (Felder: `title`, `slug`, `status`, `kicker/eyebrow`, `summary`,
  `body` (Rich/Blocks), `hero_image` (File), `gallery`, `published_date`, `tags`, `related` (Links/M2A),
  `seo_*`). Frontend: Liste **`/journal`** (oder Nav-Punkt „Journal" umwidmen) + Detail `/journal/[slug]`,
  inkl. SEC-1-Statusfilter. Card-Komponente + Homepage-Feed.
  _Abhängigkeit:_ nutzt E1.3 (Files) für Hero; Tags thin bis E2.2.
- **E3.2 Suche auf Pagefind:** statischer Suchindex post-build über `dist/` statt client-seitigem
  Fuzzy (das aktuell den **gesamten** Index in den Browser lädt → skaliert schlecht). Astro-Integration.
- **E3.3 Strukturierte Zutaten:** Rezept-/Cocktail-Zutaten von Text/JSON zu strukturierten Rows
  (Menge/Einheit/Zutat-Relation) — DATA_MODEL §10 offener Punkt.
- **E3.4 Karte/Geo (optional):** Geo-Felder an Restaurants + Kartenansicht.

**Tests E3:** Artikel anlegen→published→`/journal` zeigt ihn, draft bleibt raus (SEC-1);
Pagefind findet Restaurant/Kritik/Artikel; a11y-Smoke auf neuen Seiten.

---

## 4. Phase E4 – Öffentlich & Feinschliff

- **E4.1 Selektiv öffentliche Seiten:** pro Pfad Access-Bypass + `robots`/SEO bewusst aktivieren
  (Checkliste [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md) §11). SEC-1-Statuslogik als Schutz.
- **E4.2 Externe Backup-Kopie + Restore-Drill** → schließt **P11** endgültig.
- **E4.3 Logo/Wortmarke** final (aktuell Platzhalter-Glyph).
- **E4.4 Docker-Neubewertung** (ARCHITECTURE §3) bei wachsenden Diensten.

---

## 5. Reihenfolge, Abhängigkeiten, Quick-Wins

```text
Quick-Win  : E1.1 (Admin-Zugang)  ── sofort, ~10 Min, entkoppelt
E1.1 → E1.2 (Auto-Rebuild) → E1.3 (Files+Bake) → E1.4 (Admin-UX)
E1.3 ──┬→ E3.1 (Artikel-Typ kann starten, sobald Files da sind)
E2.1/2.2 (Taxonomien/Tags) ── Basis für echte Filter (E2.5) und reiche Artikel-Tags
E3.2 (Pagefind) ── unabhängig, jederzeit einschiebbar
P11-Rest (Restore-Drill) ── vor der ersten echten Migration in E2
```

Empfohlener Start: **E1.1 als Quick-Win**, dann E1.2 + E1.3 (das ist der eigentliche „Edit-Modus"-Hebel),
parallel/danach E3.1 (Artikel-Typ). E2 (relationale Migration) als bewusst eigener, backup-gesicherter Block.

## 6. Offene Entscheidungen (Decision Log)

| #   | Entscheidung          | Optionen                                               | Default-Vorschlag                                      |
| --- | --------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| 1   | Directus-Dauerbetrieb | NSSM-Dienst vs. Task „run at startup"                  | NSSM (sauberes Restart-on-crash)                       |
| 2   | Auto-Rebuild-Trigger  | Webhook-Listener vs. nur nächtlich                     | Webhook + nächtlicher Backstop                         |
| 3   | Bild-Quelle           | nur Files vs. nur public/assets vs. Hybrid             | Hybrid (Design-Assets statisch, Fotos via Files+Bake)  |
| 4   | Artikel-Body          | Markdown vs. Directus-Blocks/Rich-Text                 | Markdown/Rich-Text (einfach, portabel) — final in E3.1 |
| 5   | „Journal"-Nav         | Home behalten + neuer Punkt vs. „Journal"=Artikelliste | „Journal" = Artikelliste, Home bleibt `/`              |
| 6   | Links-Relation        | Many-to-Any vs. Junctions                              | M2A testen, sonst Junctions (DATA_MODEL §10)           |
| 7   | Halbe Sterne          | jetzt vs. später                                       | später (DATA_MODEL §10)                                |

## 7. Definition of Done & Quality Gates (je Tranche)

```powershell
# Laptop, vor jedem Push:
corepack pnpm lint ; corepack pnpm typecheck ; corepack pnpm test ; corepack pnpm build
# bei Schema/Migration zusätzlich:
#  - pg_dump-Backup vorhanden
#  - Migrationsskript idempotent, Counts vor/nach verifiziert
#  - Restore-Drill bei Typwechseln
# Deploy: deploy/rebuild.ps1 grün + Smoke zumfettigenjoe.com / admin.zumfettigenjoe.com
```

Doku-Pflicht: jede Tranche aktualisiert DEPLOY_STATE.md (Stand) und ggf. DATA_MODEL.md (Schema).

---

## 8. Umsetzungsstand (2026-05-29)

Alle Phasen durchgearbeitet. Quality Gates am Laptop grün: **lint 0**, **typecheck
0/0/0**, **50 Tests** (war 26), **38 Seiten** Build (war 35), Prettier sauber.
Legende: ✅ gebaut & verifiziert (Repo) · 🔶 gebaut, Live-Ausführung ist Handoff
(VPS/Cloudflare/DB) · 📝 bewusst dokumentiert/zurückgestellt.

| Tranche                                            | Status | Artefakt                                                                                                                                                                                                            |
| -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E1.1** Admin hinter Access                       | 🔶     | `deploy/ensure-directus-service.ps1` (Dauerbetrieb) + [ADMIN_ACCESS.md](ADMIN_ACCESS.md) Runbook. Access-App/Public-Hostname = Cloudflare-Dashboard.                                                                |
| **E1.2** Auto-Rebuild                              | 🔶     | `deploy/rebuild-listener.mjs` (loopback, Shared-Secret, Debounce) + `install-rebuild-listener.ps1`; [CONTENT_REBUILD.md §5](CONTENT_REBUILD.md). Flow + Task = VPS.                                                 |
| **E1.3** Files + Bake                              | ✅🔶   | `src/lib/bake/manifest.ts` (+Test), `deploy/bake-files.mjs`, Loader-Integration, additive `image_file` (`schema/media.ts`), in `rebuild.ps1`; [MEDIA_BAKE.md](MEDIA_BAKE.md). `schema:apply` + realer Upload = VPS. |
| **E1.4** Admin-UX                                  | 🔶     | `presets:apply` (gespeicherte Filter) + `meta:refine` (Display-Templates), idempotent; [DIRECTUS_ADMIN_UX §12a](DIRECTUS_ADMIN_UX.md). Ausführung = VPS. Feldgruppen/Dashboard 📝 offen.                            |
| **E3.1** Journal-Artikel-Typ                       | ✅     | Voller Stack: Typ, Stub, derive/SEC-1, Mapper, Directus-Collection, Seed, `/journal` + `/journal/[slug]`, Card, Nav, Home-Feed, Suche. +Tests.                                                                      |
| **E2.1/2.2** Taxonomien/Tags relational            | 🔶     | `slug.ts` (+Test), additive M2M/M2O (`taxonomy-relations.ts`), `relations:apply` + `migrate:taxonomies` (idempotent); [MIGRATION_E2.md](MIGRATION_E2.md). Live-Migration nach Backup+Drill = Handoff.               |
| **E2.3–2.5** Links-M2A / reiche Felder / FE-Filter | 📝     | In MIGRATION_E2 spezifiziert; Frontend-Cutover bewusst nach erfolgreicher Live-Migration.                                                                                                                           |
| **E3.2** Pagefind                                  | ✅🔶   | `data-pagefind-body`, progressive `/suche` (Fallback bleibt), `search:index`, in `rebuild.ps1`; [SEARCH.md](SEARCH.md). UI live in Prod.                                                                            |
| **E3.3** Strukturierte Zutaten                     | ✅     | `src/lib/recipe/amount.ts` (Parser/Scaler, +Test). Relationale Zutaten-Rows 📝 (eigene Migration).                                                                                                                  |
| **E3.4** Geo/Karte                                 | 📝     | Zurückgestellt: externe Kartenkacheln verraten besuchte Orte → widerspricht private-first; Neubewertung in E4.1-Kontext.                                                                                            |
| **E4.1** Selektiv öffentlich                       | ✅🔶   | `robots.txt` (Disallow), `BaseLayout`-Prop `index` (Default noindex); Public-Checkliste [POLISH_PUBLIC.md](POLISH_PUBLIC.md). Access-Bypass = Dashboard.                                                            |
| **E4.2** Externe Backups (P11)                     | 🔶     | `deploy/backup-external.ps1` (Dump + offsite + Retention). Task + Restore-Drill = VPS.                                                                                                                              |
| **E4.3** Logo                                      | 📝     | Wortmarke-Assets existieren; Header-Wechsel = Owner-Design-Entscheidung.                                                                                                                                            |
| **E4.4** Docker                                    | 📝     | Empfehlung: nativ bleiben; Trigger für Neubewertung benannt.                                                                                                                                                        |

**Verbleibende Handoffs (VPS/Cloudflare/DB – nicht aus dem Repo automatisierbar):**

1. `schema:apply` für `image_file` (E1.3) + `presets:apply`/`meta:refine` (E1.4).
2. Cloudflare: Access-App + Public Hostname `admin.zumfettigenjoe.com` → `127.0.0.1:8055` (E1.1).
3. `JOES_REBUILD_TOKEN` in `.env`, `install-rebuild-listener.ps1`, Directus-Flow (E1.2).
4. E2: `pg_dump`-Backup → Restore-Drill → `relations:apply` + `migrate:taxonomies` → Verifikation; danach Frontend-Cutover (E2.5).
5. E4.2: `backup-external.ps1` als täglicher Task + erster Restore-Drill.

**Nicht im Laptop-Gate prüfbar (ehrlich):** Build im `JOES_DATA_SOURCE=directus`-Modus,
der reale Bild-Bake, die M2M-Erstellung und die Pagefind-UI zur Laufzeit – alle
brauchen eine laufende Directus-Instanz bzw. das ausgelieferte `dist/`. Sie sind
typecheck-/lint-/syntaxgeprüft und gegen die dokumentierten Runbooks abgesichert,
aber **gegen Live noch zu verifizieren** (Reihenfolge oben).
