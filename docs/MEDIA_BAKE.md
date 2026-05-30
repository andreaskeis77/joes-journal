# MEDIA_BAKE – Bild-Upload über Directus Files (E1.3)

**Stand:** 2026-05-29 · Teil von [ROADMAP_EXPANSION.md](ROADMAP_EXPANSION.md) §E1.3

Ziel: Andreas lädt Fotos **in Directus** hoch und sieht sie nach dem nächsten
Rebuild **auf der Website** – ohne Pfade von Hand zu pflegen, ohne den VPS
anzufassen.

## Warum „Bake" statt Laufzeit-URL

Das Frontend ist **statisch** (`dist/`), und Directus liegt hinter **Cloudflare
Access**. Eine Laufzeit-URL `https://admin.zumfettigenjoe.com/assets/<id>` wäre
also auth-geschützt → Bilder kaputt. Lösung: ein **Build-Zeit-Bake** lädt die
referenzierten Dateien herunter und legt sie als **lokale Assets** in `dist/`
ab. Damit bleibt alles statisch **und** privat.

## Bausteine

| Baustein                         | Rolle                                                                     |
| -------------------------------- | ------------------------------------------------------------------------- |
| `image_file` (Feld)              | additive m2o-Referenz `-> directus_files` auf den visuellen Collections   |
| `deploy/bake-files.mjs`          | lädt referenzierte Dateien nach `public/_uploads/`, schreibt das Manifest |
| `src/data/uploads-manifest.json` | generierte Map `fileId -> /_uploads/<id>.<ext>` (committet als `{}`)      |
| `src/lib/bake/manifest.ts`       | `resolveImage()` – baked File gewinnt über Pfad-String                    |
| `src/data/loader-directus.ts`    | wendet `resolveImage()` nach dem Mapping auf alle Bildfelder an           |

**Hybrid (Decision Log #3):** kuratierte Design-Assets bleiben in
`public/assets/` (Pfad-String `image`); **hochgeladene Fotos** kommen über
Directus Files + Bake. Solange kein `image_file` gesetzt ist, bleibt der
bisherige Pfad gültig – rein additiv, nichts Bestehendes ändert sich.

## Einmalig: Schema nachziehen (VPS, Directus läuft)

Die `image_file`-Felder + Relationen werden additiv per `schema:apply` angelegt:

```powershell
# Administrator-PowerShell auf dem VPS, Directus läuft
cd C:\joes-journal\repo\directus
corepack pnpm run schema:apply
```

`apply-schema.ts` legt `image_file` (Typ `uuid`, Interface `file-image`) auf
`restaurants`, `restaurant_reviews`, `articles`, `recipes`, `cocktails`,
`equipment` an und verknüpft es mit `directus_files` (`ON DELETE SET NULL` →
beim Löschen einer Datei fällt das Frontend automatisch auf den Pfad-String
zurück). Idempotent: bereits vorhandene Felder/Relationen werden übersprungen.

## Routine: Foto hochladen → live

1. In Directus den Datensatz öffnen (z. B. eine Kritik oder einen Journal-Beitrag).
2. Beim Feld **Bild (Upload)** ein Foto hochladen (landet in `directus/uploads/`).
3. Speichern, Status auf **Veröffentlicht** setzen.
4. Rebuild – manuell oder per Auto-Rebuild (E1.2):
   ```powershell
   cd C:\joes-journal\repo
   .\deploy\rebuild.ps1
   ```
   `rebuild.ps1` ruft `bake-files.mjs` **vor** dem Build auf.

Ergebnis: Das Foto liegt als `dist/_uploads/<id>.<ext>` und wird lokal
ausgeliefert. Kein Laufzeit-Call zu Directus.

## SEC-1 / Privatsphäre

`bake-files.mjs` lädt **nur Dateien, die von veröffentlichten Inhalten
referenziert werden** (Kritiken/Artikel mit `status = published`; die übrigen
Collections sind ohnehin öffentlich). Ein Foto an einem Entwurf landet damit
**nie** im öffentlichen `dist/`. Keine Bulk-Kopie aller Uploads.

## Artefakte & Git

- `public/_uploads/` ist **gitignored** (generiert, kann groß sein).
- `src/data/uploads-manifest.json` ist als `{}` eingecheckt und wird vom Bake
  lokal überschrieben. `rebuild.ps1 -WithCodeUpdate` setzt es vor `git pull`
  zurück (`git checkout -- …`), damit der Pull nicht an lokalen Änderungen
  scheitert; der Bake regeneriert es danach.
- Keine Secrets im Skript: Credentials kommen aus der gitignored `.env`. Fehlen
  sie, ist der Bake ein No-op (Exit 0) – Stub-Umgebungen laufen unverändert.

## Grenzen (bewusst, später)

- **Galerien** (`gallery_images`) bleiben vorerst Pfad-Strings; nur das
  Hero-/Karten-Bild (`image_file`) ist baked. M2M-Galerie-Files = späterer Schritt.
- Keine Bildtransformation/-skalierung beim Bake (Originaldatei wird kopiert).
  Astro-Image-Optimierung über `image_file` ist ein möglicher Folgeschritt.
