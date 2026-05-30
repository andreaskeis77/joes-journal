# SEARCH – Suche im Journal (E3.2)

**Stand:** 2026-05-29 · [ROADMAP_EXPANSION.md](ROADMAP_EXPANSION.md) §E3.2

Zweistufige Suche auf [`/suche`](../src/pages/suche/index.astro):

| Stufe                       | Wann                                   | Wie                                                    |
| --------------------------- | -------------------------------------- | ------------------------------------------------------ |
| **Pagefind** (primär)       | Produktion (Index `dist/pagefind/` da) | statischer Index, lädt nur relevante Chunks – skaliert |
| **Client-Fuzzy** (Fallback) | Dev / kein Index gebaut                | bestehender, eingebetteter Suchindex (e2e-getestet)    |

## Warum

Die ursprüngliche Suche bettet den **gesamten** Index in die Seite ein und filtert
clientseitig – für Dutzende Einträge ok, für hunderte nicht. **Pagefind** baut nach
dem Build einen statischen Index über `dist/` und lädt im Browser nur die zur
Anfrage passenden Index-Fragmente. Die alte Suche bleibt als **Fallback** erhalten
(„additiv, Fallback behalten") und greift, wenn `/pagefind/` fehlt (Dev, oder falls
der Index-Schritt mal nicht lief).

## Indexierung

- Pagefind indexiert nur den Hauptinhalt: `<main data-pagefind-body>` in
  [BaseLayout](../src/layouts/BaseLayout.astro) – Header/Footer bleiben außen vor.
- Die `/suche`-Seite selbst trägt `data-pagefind-ignore` (kein Selbst-Index).
- **SEC-1:** Entwürfe sind ohnehin nicht im `dist/`, also auch nicht im Index.

## Produktion: Index erzeugen

`deploy/rebuild.ps1` ruft nach jedem erfolgreichen Build automatisch:

```powershell
corepack pnpm exec pagefind --site dist   # -> dist/pagefind/
```

Self-guarding: schlägt Pagefind fehl, bricht der Rebuild **nicht** ab – die
Fallback-Suche bleibt funktionsfähig (`-SkipSearchIndex` überspringt den Schritt
bewusst). Manuell: `corepack pnpm run search:index` (nach einem Build).

## Progressive Enhancement

`/suche` lädt `/pagefind/pagefind-ui.{js,css}` dynamisch. Bei Erfolg wird die
Pagefind-UI eingeblendet und die Fallback-Suche ausgeblendet; bei `404` (kein
Index) bleibt die Fallback-UI. Ein `?q=`-Parameter wird in beide übernommen.

## Tuning (später)

- Listen-/Index-Seiten (`/kritiken`, `/rezepte`, …) werden derzeit mit
  indexiert → leichte Dubletten zu Detailseiten. Bei Bedarf `data-pagefind-ignore`
  auf die Karten-Grids der Listenseiten setzen.
- Facetten/Filter via `data-pagefind-filter` (Stadt, Küche) – sinnvoll zusammen
  mit den echten Taxonomien aus E2.
