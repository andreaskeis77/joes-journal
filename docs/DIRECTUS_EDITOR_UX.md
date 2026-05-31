# DIRECTUS_EDITOR_UX – Konzept: intuitiver Artikel-Editor & Bildmodell

**Stand:** 2026-05-31 · **Status:** Konzept (zur Umsetzung freigegeben werden P0+P1 zuerst)

## 1. Anlass

Beim Anlegen des ersten Journal-Artikels traten zwei UX-Probleme auf:

1. **Body lässt sich nicht beschreiben** – das Feld `body` nutzt den Directus-Interface
   `list` (Repeater). Ohne konfigurierte Unterfelder erzeugt es **leere Objekte** `{}`
   statt Textabsätze. Auf der Seite erscheint dreimal **`[object Object]`**
   ([slug].astro rendert `<p>{ {} }</p>` → `String({})`).
2. **Bild-Workflow unklar** – Hero-/Titelbild vs. Bilder im Absatz vs. Galerie sind
   nicht erkennbar getrennt; das Hochladen ist nicht intuitiv.

Beide Punkte lösen wir zusammen: ein **echter Editor** + ein **klares Bildmodell** +
**deutsche, gruppierte Felder**.

## 2. Empfehlung auf einen Blick

| Thema | Entscheidung |
| --- | --- |
| **Body-Editor** | **Markdown** (`input-rich-text-md`) **oder** Word-artiges **WYSIWYG** (`input-rich-text-html`). Beide nutzen denselben Render-Pfad und dieselbe Bild-Pipeline → die Wahl ist günstig und reversibel. Offene Frage an den Nutzer (siehe §3). |
| **Body-Datenform** | `body: string` (**ein** Text), nicht `string[]`, nicht JSON-Blöcke. |
| **Frontend-Render** | `marked.parse(body)` → `set:html` (Roh-HTML in `marked` deaktiviert → kein separater Sanitizer nötig bei Markdown). |
| **Hero/Titelbild** | Bestehendes `image_file` behalten (funktioniert + wird gebacken); umbenennen zu **„Titelbild"**, Alt-Feld `image` verstecken. |
| **Absatzbilder (inline)** | Über den Bild-Button des Editors → Directus-Datei → **Build-Zeit-Bake nach `/_uploads/` + URL-Rewrite** (Kernpunkt, siehe §4). |
| **Galerie** | Den kaputten `list` durch echten Mehrfach-Datei-Picker (`interface: "files"`, m2m) ersetzen + Bake. Letzte Phase (höchster Aufwand). |
| **Feld-UX** | Deutsche Labels/Notizen/Übersetzungen + vier Feldgruppen (Inhalt / Bilder / SEO / Verknüpfungen), rein additiv. |

## 3. Die einzige echte Entscheidung: Markdown vs. WYSIWYG

Beide geben einen vollwertigen Editor **mit Bild-Upload-Button**. Technisch sind sie
fast gleich teuer (gleicher Render-Pfad, gleiche Bake-Pipeline), also frei wählbar:

- **WYSIWYG (`input-rich-text-html`)** – fühlt sich an wie Word: Knöpfe für Fett,
  Überschrift, Bild. **Keine Syntax zu lernen** → für Einsteiger am intuitivsten.
  Preis: braucht einen echten HTML-**Sanitizer** (`sanitize-html`, eine zusätzliche
  Abhängigkeit), weil der Editor Roh-HTML erzeugt.
- **Markdown (`input-rich-text-md`)** – leichte Zeichen wie `**fett**`, `## Titel`.
  Bleibt als **reiner, portabler, git-fähiger Text** (passt zu Decision Log #4
  „body bewusst einfach & portabel"). Kein Sanitizer nötig. Preis: man sieht etwas
  Syntax.

> **Hinweis:** Der Wechsel ist später ein Einzeiler im Schema + (bei WYSIWYG) das
> Hinzufügen von `sanitize-html`. Wir starten mit der gewählten Variante; ein
> späterer Umstieg ist billig.

## 4. Kernpunkt (adversarisch verifiziert): Inline-Bilder MÜSSEN gebacken werden

**Behauptung:** Jedes im Body über Directus eingefügte Bild erzeugt eine
`/assets/<uuid>`-URL, die öffentlich hinter Cloudflare Access **nicht** erreichbar ist
→ sie muss zur Build-Zeit nach `/_uploads/` geladen und die URL umgeschrieben werden.

**Verifiziert** an drei Dateien:

1. [bake-files.mjs](../deploy/bake-files.mjs) lädt jede Datei **mit Admin-Bearer-Token**
   (`Authorization: Bearer …`). Ein öffentlicher Browser hat dieses Token nicht →
   Cloudflare Access blockt `/assets/<uuid>` → kaputtes Bild.
2. Der Bake sammelt heute Datei-IDs **nur** aus `image_file` (Hero). Body-Bilder werden
   **nie** gesammelt → ein Inline-Bild bliebe ein toter `/assets/…`-Link. Das ist die
   konkrete Lücke.
3. [manifest.ts](../src/lib/bake/manifest.ts) (`resolveImage`) + [loader-directus.ts](../src/data/loader-directus.ts)
   (`bakeImages`) zeigen das etablierte Muster: Bake schreibt `manifest[id] = "/_uploads/<id>.<ext>"`,
   der Loader ersetzt Referenzen zur Build-Zeit, Fallback = Originalpfad.

**Fazit:** Inline-Bilder brauchen (a) einen Bake-Scan, der die Asset-IDs **einsammelt**,
und (b) einen Loader-Rewrite, der die URLs **ersetzt**. Statische Seite + Access lässt
keine Laufzeit-Alternative zu.

### Konkrete Bake-Erweiterung

Markdown-Bilder sehen so aus: `![alt](http://127.0.0.1:8055/assets/<uuid>)`. **Eine**
Regex findet jede Directus-Asset-UUID (funktioniert auch für `<img src>` aus WYSIWYG).

**(A) Sammeln** – in [bake-files.mjs](../deploy/bake-files.mjs) nach der `image_file`-Schleife,
in dasselbe `fileIds`-Set (die bestehende Download-Schleife verarbeitet es unverändert):

```js
// 1b) Inline-Bilder VERÖFFENTLICHTER Artikel (SEC-1 bleibt durch den Filter gewahrt)
const ASSET_RE = /\/assets\/([0-9a-f-]{36})/gi;
try {
  const arts = await client.request(readItems("articles", {
    limit: -1, fields: ["body"], filter: { status: { _eq: "published" } },
  }));
  for (const a of arts) {
    if (typeof a.body !== "string") continue;     // leere/alte Bodies überspringen
    for (const m of a.body.matchAll(ASSET_RE)) fileIds.add(m[1]);
  }
} catch { console.warn("[bake] articles.body inline-scan skipped"); }
```

**(B) Umschreiben** – neue, testbare Pure-Function in [manifest.ts](../src/lib/bake/manifest.ts):

```ts
const ASSET_RE = /\/assets\/([0-9a-f-]{36})/gi;
export function rewriteBodyAssets(body: string, manifest: UploadsManifest): string {
  return body.replace(ASSET_RE, (whole, id) => manifest[id] ?? whole); // ungebacken → unverändert
}
```

**(C) Anwenden** – in [loader-directus.ts](../src/data/loader-directus.ts), direkt nach
`raw.articles.map(mapArticle)`:

```ts
const articles = bakeImages(raw.articles.map(mapArticle), raw.articles);
articles.forEach((a) => { a.body = rewriteBodyAssets(a.body, manifest); });
```

Reihenfolge stimmt: `rebuild.ps1` führt `bake-files.mjs` **vor** `astro build` aus.

## 5. Body-Editor: Datenform + exakte Frontend-Änderungen (im Gleichschritt)

Alle Stellen müssen **zusammen** geändert werden, sonst bricht `pnpm typecheck/test`.

1. **Schema** [articles.ts](../directus/bootstrap/schema/articles.ts) – `body`-Feld ersetzen:
   ```ts
   {
     field: "body",
     type: "text",                          // war: json
     meta: {
       interface: "input-rich-text-md",     // war: list  (bzw. input-rich-text-html für WYSIWYG)
       width: "full",
       note: "Fließtext in Markdown. **fett**, _kursiv_, ## Zwischentitel, Bilder über den Bild-Button.",
       // kein special: ["cast-json"] mehr
     },
     schema: { is_nullable: true },
   }
   ```
   > **Harter Stolperstein – nicht additiv.** `apply-schema.ts` gleicht nur **fehlende**
   > Felder ab, **nicht** Typänderungen. Der Wechsel `json → text` am bestehenden
   > `body`-Feld muss **manuell im Directus-Admin** erfolgen (Feld löschen + per
   > `schema:apply` neu anlegen, **oder** im Data-Model-UI den Typ ändern). Das ist der
   > eine Klick-Schritt für den Nutzer.

2. **Directus-Typ** `src/lib/directus/schema.ts`: `body: string | null;` (war `string[] | null`).
3. **Mapper** `src/lib/directus/mappers.ts`: `body: d.body ?? "",` (war `?? []`).
4. **Domain-Typ** [stub.ts](../src/data/stub.ts): `body: string;` (war `string[]`); Doc-Kommentar anpassen.
5. **Renderer** [\[slug\].astro](../src/pages/journal/[slug].astro):
   ```astro
   ---
   import { marked } from "marked";
   const bodyHtml = marked.parse(article.body ?? "", { async: false }); // Roh-HTML per Config escaped
   ---
   <div class="container body" set:html={bodyHtml} />
   ```
   Bestehendes `.body p`-CSS bleibt; `.body h2/.body h3/.body img`-Regeln ergänzen.
6. **Such-Index** [derive.ts](../src/data/derive.ts) **(PFLICHT, leicht übersehen):**
   `...a.body` → `a.body`. Ein gespreizter **String** zerfiele in Einzelzeichen und
   würde den Suchindex zerstören. (`rv.body` bei Kritiken bleibt `...rv.body`.)
7. **Tests** `src/lib/directus/mappers.test.ts`: Body-Fixtures werden Strings; Assertions
   von `toHaveLength(n)` → `toContain("Absatz")`.
8. **Abhängigkeit:** `marked` ergänzen. Der Client holt bereits `fields: ["*"]`, also
   kommt `body` ohne Fetch-Änderung mit.

### Sicherheit (XSS)
Einzelner, vertrauenswürdiger Autor, hinter Access, zur Build-Zeit zu statischem HTML
gerendert. **Entscheidung:** Autor vertrauen, aber **Roh-HTML in Markdown verbieten**
(`marked` so konfigurieren, dass eingebettetes HTML escaped wird). Dann ist **kein**
separater Sanitizer nötig. Bei späterem Umstieg auf `input-rich-text-html` entfällt diese
Garantie → dann **muss** `sanitize-html` mit Tag-Allowlist dazu.

## 6. Bildmodell

- **Hero/Titelbild (`image_file`)** – existiert bereits (`interface: "file-image"`, m2o →
  `directus_files`), wird gebacken, wird von `resolveImage` dem Alt-String `image`
  vorgezogen. Nur die UX ist verwirrend → **nur Meta** (additiv): umbenennen zu
  **„Titelbild"**, Notiz „Großes Bild oben auf der Seite. Hierhin hochladen."; Alt-Feld
  `image` verstecken (`meta.hidden: true`) – bleibt als Fallback, keine Daten-Migration.
- **Inline (Body)** – Bild-Button des Editors → Bake + Rewrite (§4).
- **Galerie (`gallery_images`)** – **gleicher kaputter `list`-Fall** wie body. Ersetzen
  durch neues `gallery_files` (`interface: "files"`, m2m → `directus_files` mit Junction
  analog `fileRelations` in [media.ts](../directus/bootstrap/schema/media.ts)); UUIDs im
  Bake sammeln, im Mapper über das Manifest zu `/_uploads/`-Pfaden auflösen; altes
  `gallery_images` als versteckten Fallback behalten. Der bestehende Guard
  `galleryImages.length > 0` lässt eine leere Galerie **nichts** rendern → sicher
  aufschiebbar.

## 7. Deutsche Feld-UX, Gruppierung, i18n, Presets

Alles **additive Meta** über ein neues `refine-fields.ts` (Muster von `refine-meta.ts`,
nutzt `updateField`; `schema:apply` fasst bestehende Feld-Meta nicht an).
Gruppen-Container als `type: "alias"`-Felder.

- **Feldgruppen** (Directus-11-`group-detail`; Mitglieder bekommen `meta.group`):
  - **Inhalt** – `eyebrow`, `title`, `slug`, `summary`, `body`
  - **Bilder** – `image_file` (Titelbild), `gallery_files`; `image` hier versteckt
  - **SEO** – `seo_title`, `seo_description` (eingeklappt)
  - **Verknüpfungen** – `related_*`, `tags` (eingeklappt)
- **i18n** – `meta.translations: [{ language: "de-DE", translation: "…" }]` je Feld
  (z. B. body → „Beitragstext", `image_file` → „Titelbild", `published_date` →
  „Veröffentlicht am") + deutsche `meta.note`.
- **Defaults/Automatik** – `status` default `"draft"` ist gesetzt. Für `published_date`
  optional ein Flow („Status → published & Datum leer ⇒ `$NOW`") oder Notiz „leer lassen
  = beim Veröffentlichen gesetzt". `date_created/_updated` bleiben hidden+readonly.
- **Presets/Display-Template** sind vorhanden (`articles: "{{title}} ({{status}})"`,
  Bookmarks Entwürfe/Veröffentlicht). Optional „Ohne Titelbild"-Bookmark.

## 8. Phase 0 – den aktuellen Artikel heute reparieren (ohne Schema/Code-Deploy nötig)

`[object Object]` ×3 kommt vom leeren `list`-Repeater (`[{}, {}, {}]`). Schnellster
robuster Fix: ein **3-Zeilen-Guard**, damit Objekte nie als String landen, + die leeren
Einträge entfernen.

1. **🖥️ Directus-Admin (127.0.0.1:8055)** → Journal → Artikel öffnen → bei **body** die
   drei leeren Repeater-Zeilen löschen (Papierkorb).
2. **Frontend-Guard** in [\[slug\].astro](../src/pages/journal/[slug].astro) (überlebt alte + neue Daten):
   ```astro
   {article.body
     .map((p) => (typeof p === "string" ? p : (p?.text ?? "")))
     .filter(Boolean)
     .map((paragraph) => <p>{paragraph}</p>)}
   ```
3. **💻 VPS-PowerShell:** `cd C:\joes-journal\repo; .\deploy\rebuild.ps1`
4. **🌐 zumfettigenjoe.com:** kein `[object Object]` mehr (Strg+F5).

> Der Guard wird in Phase 1 durch das `set:html`-Rendering ersetzt.

## 9. Phasenplan (jede Phase einzeln auslieferbar + prüfbar)

| # | Oberfläche | Was | Anwenden + Rebuild | Risiko |
| --- | --- | --- | --- | --- |
| **0** | Frontend | Defensiver Body-Guard + leere Zeilen entfernen | Gates grün → 💻 `rebuild.ps1` | minimal |
| **1** | Schema + Frontend (Gleichschritt) | `body` → `text`/`input-rich-text-md` (o. `-html`); `schema.ts`, `mappers.ts`, `stub.ts`, `[slug].astro` (`marked`+`set:html`), `derive.ts` (`a.body`!), Tests; `marked` | 🖥️ `body`-Typ **manuell** im Data-Model ändern; Gates grün → 💻 `rebuild.ps1` | **mittel** – einzige Typänderung. Live-Text vorher sichern |
| **2** | Bake + Loader | Inline-Scan (1b); `rewriteBodyAssets`; Anwendung im Loader | Gates grün → 💻 `rebuild.ps1` (Bake läuft automatisch zuerst) | niedrig – reine Funktion; ungebackene URLs bleiben |
| **3** | nur Directus-Meta | Hero → „Titelbild" + `image` verstecken; Feldgruppen; deutsche Labels; published_date-Flow | 💻 `pnpm meta:refine` (bzw. neues `refine-fields.ts`); **kein** Rebuild nötig | sehr niedrig |
| **4** | Schema + Bake + Mapper | `gallery_files` m2m + Junction; IDs im Bake; im Mapper auflösen | 💻 `pnpm schema:apply` (additiv) → Gates → `rebuild.ps1` | **am höchsten** – neue Junction. Bewusst zuletzt |

**Prüfung je Phase:** P0/P1 – Artikel zeigt formatierten Fließtext, kein `[object Object]`,
Suche findet Body-Text; P2 – Bild im Editor einfügen, rebuild, `src` ist `/_uploads/<uuid>`
(nicht `/assets/`); P3 – Formular gruppiert, deutsch, „Titelbild" eindeutig; P4 – mehrere
Galeriebilder laden & rendern aus `/_uploads/`.

**Zuerst P0 + P1** – lösen zusammen beide gemeldeten Probleme (kein `[object Object]`,
klares Schreiben) mit **einer** Abhängigkeit, kleinstem Frontend-Diff und genau **einer**
riskanten manuellen Typänderung. P2–P4 sind additiv und einzeln prüfbar; die teure
Galerie-m2m kommt zuletzt.

## 10. Drei Dinge, die nicht vergessen werden dürfen

1. Die `body`-Typänderung (`json → text`) geht **nicht** über `pnpm schema:apply`
   (additiv-only) → **manuell im Directus-Admin**.
2. [derive.ts](../src/data/derive.ts) muss von `...a.body` auf `a.body` wechseln, sobald
   `body` ein String ist, sonst zerbricht der Suchindex in Einzelzeichen.
3. `marked` so konfigurieren, dass Roh-HTML escaped wird → kein Sanitizer nötig (ein
   späterer Wechsel zu `input-rich-text-html` bringt die Sanitizer-Pflicht zurück).

## 11. Betroffene Dateien

- `directus/bootstrap/schema/articles.ts` (body, gallery, image)
- `src/lib/directus/schema.ts` (`DirectusArticle.body`)
- `src/lib/directus/mappers.ts` (`mapArticle` body) + `mappers.test.ts`
- `src/data/stub.ts` (`ArticleStub.body`)
- `src/pages/journal/[slug].astro` (Render, Hero, Galerie)
- `src/data/derive.ts` (Suchindex – `...a.body` → `a.body`)
- `src/lib/bake/manifest.ts` (`resolveImage`; neu `rewriteBodyAssets`)
- `src/data/loader-directus.ts` (`bakeImages`; `rewriteBodyAssets` anwenden)
- `deploy/bake-files.mjs` (Inline-Scan; Download-Schleife unverändert)
- `directus/bootstrap/refine-meta.ts` / `apply-presets.ts` (Muster; neu `refine-fields.ts`)
- `directus/bootstrap/schema/media.ts` (`image_file`, `fileRelations`-Muster für Galerie-m2m)
