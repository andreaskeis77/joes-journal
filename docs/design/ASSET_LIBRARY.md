# joes-journal – Asset Library & Bildgenerierungs-Spezifikation

**Projekt:** `joes-journal`  
**Website:** Zum Fettigen Joe  
**Subline:** Ein persönliches Journal über Restaurants, Küche, Cocktails und guten Geschmack.  
**Signatur:** powered by umami  
**Zweck:** Asset-Übersicht + Prompt-Grundlage für spätere Bildgenerierung  
**Stand:** 2026-05-16

---

## 1. Zweck dieses Dokuments

Dieses Dokument definiert die geplante visuelle Asset-Bibliothek für `joes-journal`.

Es erfüllt zwei Zwecke:

1. **Prompt- und Produktionsgrundlage**  
   Für spätere Bildgenerierung mit ChatGPT / Bildgeneratoren. Die Beschreibungen sollen so präzise sein, dass Bilder, Grafiken, Header, Icons und UI-Elemente konsistent mit dem Designsystem erzeugt werden können.

2. **Asset-Katalog für das Projekt**  
   Später dient dieses Dokument als Übersicht, welche visuellen Elemente existieren, wie sie heißen, wofür sie gedacht sind und wie sie eingesetzt werden dürfen.

Die Liste ist bewusst großzügig angelegt. Nicht alles muss im MVP erzeugt oder eingebaut werden. Ziel ist eine hochwertige, konsistente visuelle Bibliothek.

---

## 2. Marken- und Stilgrundlage

### 2.1 Markenformel

```text
Joe = Charakter, Wärme, Essen, Haltung, persönlicher Blick
umami = Kompetenz, Qualität, Ruhe, kulinarische Ernsthaftigkeit
```

### 2.2 Visuelle Richtung

Die Website soll wirken wie:

- hochwertiges kulinarisches Editorial
- persönliches Gastro-Journal
- warmes, ruhiges Food-Magazin
- private, aber sehr gut kuratierte Genussbibliothek
- leicht humorvoll, aber nicht albern
- professionell, aber nicht steril

### 2.3 Nicht gewünscht

Nicht verwenden:

- billiger Diner-/Fastfood-Look
- übertriebene Retro-Comic-Optik
- KI-Kitsch, Neon, Sci-Fi, Hologramme
- generische Stockfoto-Optik
- aggressive Foodblog-Buntheit
- überladene Restaurant-Szenen
- Fake-Logos oder Fantasie-Text auf Schildern
- erkennbare reale Restaurants, reale Marken oder reale Personen
- zu dunkle Bar-Ästhetik, bei der Inhalte schwer lesbar werden

---

## 3. Farbpalette

Alle Assets sollen an dieser Palette ausgerichtet sein.

| Rolle | Name | Hex | Einsatz |
|---|---|---:|---|
| Primärfarbe | Joe Rot / BBQ-Rot | `#B23A32` | Akzente, Buttons, Ratings, kleine grafische Highlights |
| Sekundärfarbe | umami Petrol | `#2E7070` | Links, ruhige Akzente, sekundäre Aktionen, Signatur |
| Hintergrund | Warmgrau | `#F5F3F1` | Seitenhintergrund, helle Flächen |
| Oberfläche | Weiß | `#FFFFFF` | Cards, Inhaltsflächen |
| Footer / Fläche | Hellgrau | `#EDEBE9` | abgesetzte Flächen, Footer, Sektionen |
| Haupttext | Dunkelgrau | `#222222` | Text, Icons, Linien |
| Sekundärtext | Mittelgrau | `#5F5A56` | Meta, Nebeninfos |
| Border | Warmes Grau | `#DDD8D2` | Rahmen, Divider |
| Erfolg | gedecktes Grün | `#2F6F4E` | positive Status, sparsam |
| Warnung | Senf/Amber | `#B87514` | Hinweis, sparsam |
| Gefahr | dunkles Rot | `#9F2D24` | Fehler, sparsam |

### 3.1 Farbverwendung in Bildern

Bilder sollen nicht künstlich in der Palette eingefärbt werden, aber die Farbwelt respektieren:

- warme Holz-, Creme-, Stein-, Papier- und Foodtöne
- dezente rote Akzente, z. B. Serviette, Wein, Tomate, Paprika, Keramik
- dezente petrolfarbene Akzente, z. B. Fliese, Wanddetail, Stoff, Karte
- keine grellen Primärfarben
- kein kaltes, klinisches Weiß
- keine knalligen Neonfarben

---

## 4. Typografie und Text in Bildern

### 4.1 Website-Typografie

| Zweck | Font |
|---|---|
| Headlines | Poppins |
| Body/UI | Inter |
| Logo/Wortmarke | eigenes Branding später |

### 4.2 Regel für generierte Bilder

**Grundregel:** Generierte Bilder sollen möglichst **keinen lesbaren Text** enthalten.

Warum:

- KI-Bildgeneratoren erzeugen oft fehlerhaften Text.
- Texte sollen im Frontend typografisch sauber gesetzt werden.
- Logos, Claims, Buttons und Labels werden als HTML/CSS umgesetzt.

Erlaubt sind:

- abstrakte Markierungen
- unlesbare Speisekarten-Andeutungen
- unscharfe Tafeln ohne lesbaren Text
- grafische Flächen ohne Schrift

Nicht erlaubt:

- lesbare Restaurantnamen
- Fantasie-Logos
- fehlerhafte Wörter
- künstliche Typografie im Bild
- real wirkende Markenlogos

---

## 5. Bildformate und Größen

### 5.1 Masterformate

| Zweck | Seitenverhältnis | Mastergröße | Verwendung |
|---|---:|---:|---|
| Desktop Hero | 16:9 | 2400 × 1350 px | Startseite, Kategorieheader |
| Editorial Hero | 3:2 | 2400 × 1600 px | Artikel/Kritikdetail |
| Mobile Hero | 4:5 | 1440 × 1800 px | mobile Hero-Alternative |
| Card Landscape | 4:3 | 1600 × 1200 px | Karten, Listen |
| Card Square | 1:1 | 1600 × 1600 px | Grid, Avatare, Icons mit Bild |
| Portrait Feature | 4:5 | 1600 × 2000 px | Cocktails, Geräte, Zutaten |
| Open Graph | 1.91:1 | 1200 × 630 px | Social Preview später |
| Texture Tile | 1:1 | 1024 × 1024 px | dezente Hintergrundmuster |
| Icon Master | SVG | 24/32/48 px | UI Icons |
| Favicon/App Icon | 1:1 | 512 × 512 px | später |

### 5.2 Ausgabeformate

| Assettyp | Primärformat | Alternative |
|---|---|---|
| Fotos / generierte Bilder | `.webp` | `.jpg` |
| Icons | `.svg` | `.png` nur wenn nötig |
| Muster / Texturen | `.webp` oder `.svg` | `.png` |
| Logos | `.svg` | `.png` |
| Open Graph | `.webp` / `.jpg` | `.png` |

### 5.3 Benennung

Alle Dateinamen:

- lowercase
- kebab-case
- keine Umlaute
- keine Leerzeichen
- keine Sonderzeichen
- eindeutige Kategoriepräfixe
- Variantennummer am Ende

Format:

```text
<category>-<use>-<short-description>-<ratio>-v<number>.<ext>
```

Beispiele:

```text
hero-home-editorial-restaurant-table-16x9-v01.webp
restaurant-card-bistro-window-table-4x3-v01.webp
icon-restaurant-line-24.svg
pattern-warm-paper-grain-1x1-v01.webp
divider-joe-red-brush-line-wide-v01.svg
```

---

## 6. Ordnerstruktur für Assets

Empfohlene Struktur im späteren Repo:

```text
public/
  assets/
    brand/
    heroes/
    restaurants/
    reviews/
    recipes/
    cocktails/
    ingredients/
    suppliers/
    equipment/
    collections/
    backgrounds/
    patterns/
    dividers/
    icons/
    placeholders/
    stats/
    admin/
    social/
    manifest/
```

Zusätzlich:

```text
docs/
  design/
    ASSET_LIBRARY.md
    IMAGE_PROMPTS.md
    ICON_INVENTORY.md
```

Dieses Dokument kann später als `docs/design/ASSET_LIBRARY.md` ins Repo übernommen werden.

---

## 7. Globale Prompt-Regeln

### 7.1 Globaler Bildstil

Für alle generierten Foto-/Illustrationsassets:

```text
Premium editorial food photography, warm natural light, calm composition, subtle depth of field, refined but personal atmosphere, high-end culinary journal aesthetic, warm neutrals, wood, stone, linen, porcelain, glass, stainless steel, restrained accents in BBQ red #B23A32 and petrol #2E7070, no visible text, no logos, no identifiable real people, no real brands, no clutter, no neon, no sci-fi, no cheap diner theme.
```

### 7.2 Globaler Negative Prompt

Für alle generierten Bilder:

```text
No readable text, no fake words, no misspelled signs, no brand logos, no real restaurant names, no identifiable people, no celebrity faces, no watermarks, no QR codes, no menus with readable text, no product labels, no neon cyberpunk, no cartoonish fast food, no messy plates, no dirty kitchen, no extreme saturation, no distorted cutlery, no extra fingers or hands, no unrealistic food.
```

### 7.3 Foto-Stimmung

Gewünscht:

- warm
- ruhig
- hochwertig
- appetitlich
- leicht persönlich
- nicht steril
- nicht überdekoriert
- natürliches Licht oder sanftes Restaurantlicht
- echte Materialien: Holz, Stein, Leinen, Glas, Keramik, Edelstahl

### 7.4 UI-/Grafik-Stimmung

Gewünscht:

- klare Linien
- dezente Ornamentik
- feine Divider
- kleine Badge-/Stempel-Elemente
- warme Papier-/Menükarten-Anmutung
- präzise SVG-Icons
- kein Clipart-Look

---

## 8. Brand Assets

### 8.1 Wortmarke / Logo später

Noch nicht im MVP final, aber vorzubereiten.

#### `brand-wordmark-zum-fettigen-joe-primary.svg`

**Typ:** Logo/Wortmarke  
**Format:** SVG  
**Farben:** Dunkelgrau `#222222`, optional Joe Rot `#B23A32`  
**Beschreibung:** Wortmarke „Zum Fettigen Joe“, später typografisch sauber gesetzt. Kein KI-generierter Text im Bild.  
**Einsatz:** Header, Footer, About-Seite.

#### `brand-signature-powered-by-umami.svg`

**Typ:** kleine Signatur  
**Format:** SVG  
**Farben:** Petrol `#2E7070`, Dunkelgrau `#222222`  
**Beschreibung:** Dezente Signatur „powered by umami“. Später als echte SVG-Schrift setzen, nicht bildgenerieren.  
**Einsatz:** Footer, About, kleine Badges.

#### `brand-badge-joe-round.svg`

**Typ:** Badge / Siegel  
**Format:** SVG  
**Farben:** Joe Rot, Petrol, Warmgrau  
**Beschreibung:** Rundes, schlichtes Badge für „Joe“. Ohne fehleranfälligen Text oder mit später gesetztem Text.  
**Einsatz:** Favicon-Basis, Platzhalter, About-Teaser.

#### `brand-monogram-jj.svg`

**Typ:** Monogramm  
**Format:** SVG  
**Beschreibung:** Reduziertes „JJ“-Monogramm für kleine Flächen.  
**Einsatz:** Favicon, App Icon, mobile Header.

### 8.2 Favicon / App Icons

| Datei | Größe | Beschreibung |
|---|---:|---|
| `favicon-32.png` | 32×32 | kleines Browser-Favicon |
| `favicon-192.png` | 192×192 | Android / PWA |
| `apple-touch-icon.png` | 180×180 | Apple Touch Icon |
| `brand-app-icon-512.png` | 512×512 | Master App Icon |

**Stil:** Monogramm oder Badge, nicht detailreich.

---

## 9. Hero-Bilder

Hero-Bilder sind die wichtigsten emotionalen Assets. Sie sollen stark, hochwertig und wiedererkennbar sein.

### 9.1 Startseite

#### `hero-home-editorial-restaurant-table-16x9-v01.webp`

**Größe:** 2400×1350  
**Verwendung:** Startseite Desktop Hero  
**Beschreibung:** Hochwertiger Restauranttisch kurz vor dem Essen: Leinenserviette, schönes Glas, Keramik, warmes Licht, leichte Unschärfe im Hintergrund, ein Teller mit elegantem, aber nicht übertriebenem Gericht. Dezente rote Akzente, z. B. Serviette oder Sauce. Keine Personen, kein Text.  
**Prompt-Kern:**

```text
Premium editorial restaurant table scene, warm evening light, elegant but personal, linen napkin, ceramic plate, wine glass, subtle BBQ red accent, petrol shadow detail, shallow depth of field, calm composition, high-end culinary journal, no readable text, no logos, no people.
```

#### `hero-home-mobile-restaurant-table-4x5-v01.webp`

**Größe:** 1440×1800  
**Verwendung:** Startseite Mobile Hero  
**Beschreibung:** Vertikale Variante des Startseiten-Hero, mit ruhigem oberen Bereich für Textoverlay.

### 9.2 Restaurants Kategorie

#### `hero-restaurants-cool-dining-room-16x9-v01.webp`

**Beschreibung:** Allgemeines, nicht reales Restaurantinterieur mit offenen Tischen, warmem Licht, hochwertigen Materialien, dezenter Bar im Hintergrund.

#### `hero-restaurants-city-evening-window-16x9-v01.webp`

**Beschreibung:** Blick durch ein Restaurantfenster bei Abendlicht, urbane Stimmung, aber keine lesbaren Schilder.

### 9.3 Kritiken Kategorie

#### `hero-reviews-table-after-service-16x9-v01.webp`

**Beschreibung:** Tisch nach einem guten Restaurantgang: Glas, Besteck, halb leerer Teller, kleine Details. Stimmung: „gerade erlebt, jetzt reflektiert“.

#### `hero-reviews-tasting-menu-plate-16x9-v01.webp`

**Beschreibung:** Eleganter Teller im Fine-Dining-Stil, aber generisch und nicht zu künstlich.

### 9.4 Rezepte Kategorie

#### `hero-recipes-kitchen-counter-mise-en-place-16x9-v01.webp`

**Beschreibung:** Hochwertige private Küche, Zutaten vorbereitet, Messer, Schüssel, Gemüse, Holzbrett, warmes Licht.

### 9.5 Cocktails Kategorie

#### `hero-cocktails-moody-bar-glassware-16x9-v01.webp`

**Beschreibung:** Ruhige Bar-Szene mit Glas, Eis, Zitrus, Shaker, sanften Reflexionen, nicht zu dunkel.

### 9.6 Zutaten Kategorie

#### `hero-ingredients-market-mise-en-place-16x9-v01.webp`

**Beschreibung:** Hochwertige Zutaten, Gewürze, Kräuter, Zitrus, Öl, Flaschen ohne Etikett, feine Food-Journal-Optik.

### 9.7 Geräte Kategorie

#### `hero-equipment-kitchen-tools-still-life-16x9-v01.webp`

**Beschreibung:** Hochwertige Küchengeräte und Utensilien als Stillleben: Messer, Pfanne, Barwerkzeug, Thermometer, Edelstahl, Holz, keine Markenlogos.

### 9.8 Sammlungen Kategorie

#### `hero-collections-notebook-links-table-16x9-v01.webp`

**Beschreibung:** Notizbuch, Karten, ausgedruckte Restaurantnotizen ohne lesbaren Text, Glas, Stift, warme Tischszene.

### 9.9 Über Joe

#### `hero-about-joe-empty-table-journal-16x9-v01.webp`

**Beschreibung:** Persönliches Gastro-Journal auf Tisch, Glas, Stift, kleine Food-Details. Kein Mensch, keine echte Handschrift.

---

## 10. Restaurant- und Kritikbilder

### 10.1 Allgemeine Restaurantinterieurs

Diese Bilder dienen als Kategorie-, Card- oder Platzhalterbilder für Restaurants, wenn keine eigenen Fotos vorhanden sind.

#### `restaurant-interior-fine-dining-warm-4x3-v01.webp`

Fine-Dining-Raum mit warmem Licht, sauber gedeckte Tische, dezenter Luxus, keine Menschen, kein Text.

#### `restaurant-interior-bistro-window-4x3-v01.webp`

Modernes Bistro am Fenster, Holz, Messing, Keramik, Stadtlicht, einladend.

#### `restaurant-interior-open-kitchen-counter-4x3-v01.webp`

Offene Küche / Chef’s Counter, Edelstahl, warme Lampen, kein Personal erkennbar.

#### `restaurant-interior-casual-wine-bar-4x3-v01.webp`

Ruhige Weinbar, Flaschen unscharf ohne Etiketten, kleine Teller, warmes Licht.

#### `restaurant-interior-terrace-evening-4x3-v01.webp`

Terrasse am Abend, gedeckte Tische, Pflanzen, Licht, keine realen Orte.

### 10.2 Restaurant-Watchlist-Bilder

#### `restaurant-watchlist-map-notebook-4x3-v01.webp`

Karte/Notizbuch/Restaurantliste als Symbol für „noch besuchen“, ohne lesbaren Text.

#### `restaurant-watchlist-empty-table-reserved-4x3-v01.webp`

Ein schöner leerer Tisch, reservierte Stimmung, aber ohne Reserviert-Schild mit Text.

### 10.3 Kritik-Bilder

#### `review-dish-fine-dining-plate-4x3-v01.webp`

Eleganter Teller, ruhiger Hintergrund, appetitlich, nicht überzeichnet.

#### `review-service-table-detail-4x3-v01.webp`

Detail von Besteck, Glas, Serviette, kleiner Teller, Atmosphäre.

#### `review-dessert-plate-editorial-4x3-v01.webp`

Dessertteller, warmes Licht, hochwertig.

#### `review-wine-glass-table-4x3-v01.webp`

Weinglas / alkoholfreier Aperitif auf Restauranttisch, kein Etikett.

#### `review-after-dinner-table-4x3-v01.webp`

Tisch nach dem Essen, ruhiger persönlicher Moment, nicht unordentlich.

---

## 11. Rezeptbilder

### 11.1 Rezept-Kategorie

#### `recipe-card-mise-en-place-vegetables-4x3-v01.webp`

Zutaten vorbereitet, Gemüse, Kräuter, Messer, Holzbrett.

#### `recipe-card-pasta-sauce-pan-4x3-v01.webp`

Pasta-/Saucen-Szene, Pfanne, Dampf, warmes Licht.

#### `recipe-card-grill-vegetables-4x3-v01.webp`

Gegrilltes Gemüse, Grillspuren, hochwertige Food-Fotografie.

#### `recipe-card-steak-cutting-board-4x3-v01.webp`

Steak auf Holzbrett, Messer, Kräuter, nicht blutig übertrieben.

#### `recipe-card-dessert-cream-fruit-4x3-v01.webp`

Dessert, Creme, Frucht, feine Textur.

### 11.2 Methodenbilder

#### `recipe-method-knife-work-4x3-v01.webp`

Messerarbeit ohne sichtbare Hände oder mit neutraler, nicht identifizierbarer Hand nur wenn nötig.

#### `recipe-method-sauce-reduction-pan-4x3-v01.webp`

Sauce in Pfanne/Topf, Licht, Dampf, professionell.

#### `recipe-method-plating-tweezers-4x3-v01.webp`

Plating-Detail, Pinzette optional, keine Person erkennbar.

#### `recipe-method-kamado-grill-4x3-v01.webp`

Keramikgrill-artige Szene ohne Markenzeichen, Glut, Rost, indirektes Grillen.

---

## 12. Cocktail- und Barbilder

### 12.1 Cocktail Hero / Kategorie

#### `cocktail-hero-bar-tools-citrus-16x9-v01.webp`

Barwerkzeug, Zitrus, Eis, Glas, Shaker, warme Baroberfläche.

### 12.2 Cocktail Cards

#### `cocktail-card-highball-citrus-4x5-v01.webp`

Highball mit Zitrus, Eis, frische Atmosphäre, alkoholfrei möglich.

#### `cocktail-card-coupe-red-accent-4x5-v01.webp`

Coupe-Glas mit rotem Akzent, elegant, nicht kitschig.

#### `cocktail-card-rocks-glass-ice-4x5-v01.webp`

Rocks-Glas mit großem Eiswürfel, ruhiges Barlicht.

#### `cocktail-card-mocktail-ginger-lime-4x5-v01.webp`

Alkoholfreier Drink mit Ginger/Limette-Anmutung, frisch, hochwertig.

#### `cocktail-card-shaker-tools-4x3-v01.webp`

Shaker, Jigger, Barsieb, Zitrus, keine Marken.

### 12.3 Bar-Details

#### `bar-detail-ice-glass-reflection-4x3-v01.webp`

Eis, Glas, Reflexion, abstrakte Barstimmung.

#### `bar-detail-garnish-citrus-herbs-4x3-v01.webp`

Garnituren, Zitrus, Kräuter, Pinzette, kleine Schale.

#### `bar-detail-bottles-blurred-no-label-4x3-v01.webp`

Unscharfe Flaschen ohne erkennbare Etiketten, Stimmungsbild.

---

## 13. Zutaten, Lebensmittel und Getränke

### 13.1 Zutaten-Kategorie

#### `ingredient-category-spices-herbs-4x3-v01.webp`

Gewürze, Kräuter, Schalen, warmes Licht.

#### `ingredient-category-citrus-syrup-glass-4x3-v01.webp`

Zitrus, Sirupflasche ohne Etikett, Glas, Bar-/Küchenbezug.

#### `ingredient-category-oil-vinegar-ceramic-4x3-v01.webp`

Öl, Essig, Keramik, Brot, Kräuter.

#### `ingredient-category-fish-market-style-4x3-v01.webp`

Hochwertiger Fisch auf Eis, ohne konkrete Händler-/Markenidentität.

#### `ingredient-category-meat-butcher-board-4x3-v01.webp`

Hochwertiges Fleisch auf Brett, sauber, nicht grob.

#### `ingredient-category-vegetables-market-4x3-v01.webp`

Gemüse, saisonal, Marktszene, keine Menschen erkennbar.

### 13.2 Getränke / Barzutaten

#### `ingredient-drink-tonic-bubbles-4x3-v01.webp`

Tonic-/Soda-Anmutung, Glas, Bläschen, keine Flaschenlabels.

#### `ingredient-drink-ginger-lime-4x3-v01.webp`

Ingwer, Limette, Glas, Ginger-Beer-Anmutung ohne Marke.

#### `ingredient-drink-syrups-4x3-v01.webp`

Sirups in neutralen Glasflaschen, farblich zurückhaltend.

---

## 14. Lieferanten und Bezugsquellen

### 14.1 Lieferanten-Kategorie

#### `supplier-market-stall-produce-4x3-v01.webp`

Hochwertiger Marktstand, Gemüse, Körbe, keine Menschen erkennbar.

#### `supplier-butcher-counter-detail-4x3-v01.webp`

Metzger-/Fleischtheken-Anmutung, hochwertig, sauber, keine Logos.

#### `supplier-fish-counter-ice-4x3-v01.webp`

Fischtheke, Eis, frische Ware, keine Schilder.

#### `supplier-specialty-shop-shelves-4x3-v01.webp`

Feinkostregal, Gläser/Flaschen ohne Etiketten, warmes Licht.

#### `supplier-online-delivery-box-4x3-v01.webp`

Neutrale Lieferung/Box mit Zutaten, kein Logo, sauber arrangiert.

---

## 15. Geräte und Utensilien

### 15.1 Geräte-Kategorie

#### `equipment-hero-kitchen-tools-16x9-v01.webp`

Stillleben hochwertiger Geräte: Pfanne, Messer, Barwerkzeug, Thermometer, Holzbrett.

### 15.2 Geräte Cards

#### `equipment-card-knife-set-4x3-v01.webp`

Messer auf Holz/Magnetleiste, keine Marken.

#### `equipment-card-cast-iron-pan-4x3-v01.webp`

Gusseisenpfanne, Öl, Kräuter, warmes Licht.

#### `equipment-card-kamado-grill-4x3-v01.webp`

Keramikgrill-artig, keine Logos, Glut, Rost.

#### `equipment-card-gas-grill-4x3-v01.webp`

Gasgrill-artige Szene, Edelstahl, Grillrost, kein Markenzeichen.

#### `equipment-card-bar-tools-4x3-v01.webp`

Jigger, Shaker, Barsieb, Rührglas, Zitrus.

#### `equipment-card-high-end-kitchen-machine-4x3-v01.webp`

Generische hochwertige Küchenmaschine, kein Logo, sauber.

#### `equipment-card-thermometer-probe-4x3-v01.webp`

Thermometer/Probe, Kochszene, ohne Marken.

#### `equipment-card-storage-jars-4x3-v01.webp`

Vorratsgläser, Etiketten ohne Text, Küche.

### 15.3 Wunschliste

#### `equipment-wishlist-product-research-desk-4x3-v01.webp`

Laptop/Notizbuch/Produktrecherche-Anmutung, keine lesbaren Seiten, hochwertige Küche im Hintergrund.

---

## 16. Sammlungen und Linklisten

### 16.1 Sammlungen

#### `collection-card-berlin-restaurant-notes-4x3-v01.webp`

Urbane Restaurantnotizen, Stadtgefühl, Karte ohne lesbare Straßennamen.

#### `collection-card-pacojet-methods-4x3-v01.webp`

Dessert-/Sorbet-Textur, neutrale High-End-Küchengerät-Anmutung, kein Markenlogo.

#### `collection-card-bar-basics-4x3-v01.webp`

Bar-Basics: Tools, Zitrus, Glas, Sirup.

#### `collection-card-bbq-grill-notes-4x3-v01.webp`

Grillnotizen, Gewürze, Glut, Holzbrett.

#### `collection-card-wishlist-tools-4x3-v01.webp`

Wunschlisten-/Recherche-Szene mit Karten, Geräten, Notizen ohne Text.

### 16.2 Linklisten

#### `linklist-card-curated-links-notebook-4x3-v01.webp`

Notizbuch mit Linklisten-Anmutung, Laptop, Kaffee/Drink, kein lesbarer Text.

---

## 17. Platzhalterbilder

Platzhalter müssen hochwertig sein, nicht nach „Missing Image“ aussehen.

### 17.1 Content-Type Placeholder

| Datei | Zweck |
|---|---|
| `placeholder-restaurant-4x3-v01.webp` | Restaurant ohne Bild |
| `placeholder-review-4x3-v01.webp` | Kritik ohne Bild |
| `placeholder-recipe-4x3-v01.webp` | Rezept ohne Bild |
| `placeholder-cocktail-4x5-v01.webp` | Cocktail ohne Bild |
| `placeholder-ingredient-4x3-v01.webp` | Zutat ohne Bild |
| `placeholder-equipment-4x3-v01.webp` | Gerät ohne Bild |
| `placeholder-supplier-4x3-v01.webp` | Lieferant ohne Bild |
| `placeholder-collection-4x3-v01.webp` | Sammlung ohne Bild |
| `placeholder-link-4x3-v01.webp` | Link ohne Bild |

### 17.2 Stil

- abstrakte Stillleben
- keine großen Fragezeichen
- keine kaputten Bild-Icons
- warmgrauer Hintergrund
- feine Linien oder Muster
- kleines Joe/umami-Badge optional später als SVG-Overlay

---

## 18. Backgrounds und Texturen

### 18.1 Papier- und Karten-Texturen

#### `texture-warm-paper-grain-1x1-v01.webp`

Dezente warme Papierkörnung, kaum sichtbar, für Hintergründe.

#### `texture-menu-card-cream-1x1-v01.webp`

Cremige Menüpapier-Anmutung, sehr subtil.

#### `texture-linen-warm-1x1-v01.webp`

Leinenstruktur für Hero-Overlays oder About-Bereiche.

### 18.2 Pattern

#### `pattern-umami-soft-waves.svg`

Abstrakte, sehr dezente Wellenlinien, petrolfarben mit niedriger Opazität.

#### `pattern-joe-dots-warm.svg`

Feines Punktmuster in Warmgrau/Joe Rot, sehr sparsam.

#### `pattern-cutlery-minimal.svg`

Minimalistische Besteck-Linien als Hintergrundpattern, fast unsichtbar.

#### `pattern-menu-grid.svg`

Zartes Raster wie auf Rezept-/Notizkarten.

### 18.3 Einsatzregeln

- Patterns nie dominant.
- Opazität meist 3–8 %.
- Keine Lesbarkeit beeinträchtigen.
- Mobile nur sparsam einsetzen.

---

## 19. Divider, Linien und grafische Elemente

### 19.1 Divider

#### `divider-joe-red-brush-line-wide.svg`

Feine rote handwerkliche Linie, nicht zu wild, für Abschnittstrennung.

#### `divider-petrol-thin-line-wide.svg`

Sehr dünne petrolfarbene Linie, ruhig und professionell.

#### `divider-warm-dotted-line-wide.svg`

Punktlinie in warmem Grau, für Listen/Meta.

#### `divider-cutlery-center.svg`

Kleine zentrale Besteck-/Teller-Andeutung, links und rechts Linie.

### 19.2 UI-Ornamente

#### `ornament-corner-card-red.svg`

Kleines rotes Eckelement für besondere Cards.

#### `ornament-corner-card-petrol.svg`

Kleines petrolfarbenes Eckelement für umami-/Info-Cards.

#### `ornament-section-marker-dot.svg`

Kleiner Abschnittsmarker.

#### `ornament-journal-stamp.svg`

Stempelartiges Element ohne Text oder mit später gesetztem Text.

### 19.3 Linienregeln

- Linien dünn, 1–2 px.
- Meist warmgrau.
- Rot/Petrol nur als Akzent.
- Keine verschnörkelten Ornamente.

---

## 20. Icons

Icons sollen als SVG-Line-Icons umgesetzt werden.

### 20.1 Stilregeln

- 24×24 px Grundraster
- Stroke 1.75–2 px
- Rundes Linecap
- keine gefüllten Clipart-Icons
- einheitliche Ecken und Kurven
- Farbe per CSS steuerbar
- Default: `currentColor`
- keine Schrift im Icon

### 20.2 Basis-Icons

| Datei | Bedeutung |
|---|---|
| `icon-home-line-24.svg` | Startseite |
| `icon-journal-line-24.svg` | Journal |
| `icon-restaurant-line-24.svg` | Restaurant |
| `icon-review-line-24.svg` | Kritik |
| `icon-recipe-line-24.svg` | Rezept |
| `icon-cocktail-line-24.svg` | Cocktail |
| `icon-ingredient-line-24.svg` | Zutat |
| `icon-supplier-line-24.svg` | Lieferant |
| `icon-equipment-line-24.svg` | Gerät |
| `icon-collection-line-24.svg` | Sammlung |
| `icon-link-line-24.svg` | Link |
| `icon-search-line-24.svg` | Suche |
| `icon-filter-line-24.svg` | Filter |
| `icon-menu-line-24.svg` | Burger Menu |
| `icon-close-line-24.svg` | Schließen |
| `icon-chevron-right-line-24.svg` | Navigation |
| `icon-chevron-down-line-24.svg` | Dropdown |
| `icon-external-link-line-24.svg` | externer Link |
| `icon-map-pin-line-24.svg` | Ort |
| `icon-calendar-line-24.svg` | Datum |
| `icon-tag-line-24.svg` | Tag |
| `icon-star-line-24.svg` | Bewertung leer |
| `icon-star-filled-24.svg` | Bewertung gefüllt |
| `icon-star-half-24.svg` | Bewertung halb, optional |
| `icon-price-line-24.svg` | Preisniveau |
| `icon-camera-line-24.svg` | Foto |
| `icon-gallery-line-24.svg` | Galerie |
| `icon-stats-line-24.svg` | Statistik |
| `icon-lock-line-24.svg` | privat |
| `icon-admin-line-24.svg` | Admin |
| `icon-draft-line-24.svg` | Entwurf |
| `icon-published-line-24.svg` | Veröffentlicht |
| `icon-wishlist-line-24.svg` | Wunschliste |
| `icon-visited-line-24.svg` | besucht |
| `icon-reservation-line-24.svg` | Reservieren |
| `icon-globe-line-24.svg` | Website |
| `icon-clock-line-24.svg` | Zeit |
| `icon-difficulty-line-24.svg` | Schwierigkeit |
| `icon-serving-line-24.svg` | Portionen |
| `icon-glass-line-24.svg` | Glas |
| `icon-ice-line-24.svg` | Eis |
| `icon-shaker-line-24.svg` | Shaker |
| `icon-knife-line-24.svg` | Messer |
| `icon-pan-line-24.svg` | Pfanne |
| `icon-grill-line-24.svg` | Grill |
| `icon-market-line-24.svg` | Markt |
| `icon-box-line-24.svg` | Lieferung |
| `icon-note-line-24.svg` | Notiz |
| `icon-source-line-24.svg` | Quelle |

### 20.3 Icon-Farbvarianten

Icons selbst als `currentColor`; Farbe über CSS:

- Standard: Dunkelgrau
- Aktiv: Joe Rot
- Link/Info: Petrol
- Deaktiviert: Mittelgrau
- Warnung: Amber
- Erfolg: Grün

---

## 21. Status-Badges und Rating-Elemente

### 21.1 Restaurantstatus-Badges

| Datei / Token | Text | Farbe |
|---|---|---|
| `badge-status-discovered` | Entdeckt | Warmgrau + Dunkelgrau |
| `badge-status-wishlist` | Merkliste | Petrol hell |
| `badge-status-planned` | Geplant | Amber hell |
| `badge-status-visited` | Besucht | Grün hell |
| `badge-status-reviewed` | Kritik vorhanden | Joe Rot hell |
| `badge-status-revisit` | Wieder besuchen | Petrol |
| `badge-status-closed` | Geschlossen | Grau |
| `badge-status-archived` | Archiviert | Grau |

### 21.2 Contentstatus-Badges

- Entwurf
- Intern
- Veröffentlicht
- Archiviert

### 21.3 Rating

#### `rating-stars-five-base.svg`

5-Sterne-Komponente als SVG- oder CSS-Icon-Basis.

#### Einsatzregeln

- Sterne immer mit numerischem Wert kombinieren.
- Nicht nur über Farbe kommunizieren.
- Joe Rot oder warmes Gold/Amber als Akzent möglich.
- Keine Subscores im MVP.

---

## 22. Statistik-Assets

### 22.1 Stat-Icons

| Datei | Zweck |
|---|---|
| `stat-icon-restaurants-total.svg` | Restaurants insgesamt |
| `stat-icon-restaurants-visited.svg` | besucht |
| `stat-icon-restaurants-watchlist.svg` | Watchlist |
| `stat-icon-top-cities.svg` | Top-Städte/Regionen |
| `stat-icon-reviews-total.svg` | Kritiken später |
| `stat-icon-recipes-total.svg` | Rezepte später |
| `stat-icon-cocktails-total.svg` | Cocktails später |
| `stat-icon-equipment-owned.svg` | Gerätebestand später |

### 22.2 Mini-Chart-Grafiken

#### `stat-mini-bars-warm.svg`

Abstrakte kleine Balken, warmes Grau/Petrol.

#### `stat-mini-map-dots.svg`

Regionen/Städte als abstrakte Punkte, keine echte Karte.

#### `stat-mini-trend-line.svg`

Trendlinie für spätere Zeitreihen.

---

## 23. Admin-/Editor-Assets

Directus selbst bringt UI mit. Trotzdem können wir für Login, Dokumentation und Landingbereiche eigene Assets brauchen.

### 23.1 Admin Login

#### `admin-login-background-journal-desk-16x9-v01.webp`

Schreibtisch/Journal/Drink, ruhig, professionell, keine lesbaren Texte.

#### `admin-login-badge-private.svg`

Kleines Lock-/Private-Badge.

### 23.2 Editor-Hilfen

#### `admin-empty-restaurant.svg`

Illustrativer Empty State für Directus/Frontend, falls selbst genutzt.

#### `admin-empty-review.svg`

Empty State „noch keine Kritik“.

#### `admin-empty-link.svg`

Empty State „noch keine Links“.

### 23.3 Dokumentationsgrafiken

#### `diagram-architecture-simple.svg`

Architekturdiagramm: Browser → Cloudflare → Astro/Directus → PostgreSQL. Später besser manuell als SVG, nicht bildgenerieren.

#### `diagram-data-model-simple.svg`

Relationship Map, später manuell erzeugen.

---

## 24. Social und Sharing Assets

Auch wenn die Seite privat startet, sollten wir spätere öffentliche Freigaben vorbereiten.

### 24.1 Open Graph Defaults

#### `social-og-default-1200x630-v01.webp`

Default Preview für Website.

Beschreibung: Editorial Restauranttisch, Joe/umami-Farbwelt, Text im Frontend/OG später separat setzen, Bild ohne eingebetteten Text.

#### `social-og-restaurant-1200x630-v01.webp`

Default Restaurantseite.

#### `social-og-review-1200x630-v01.webp`

Default Kritikseite.

#### `social-og-recipe-1200x630-v01.webp`

Default Rezeptseite.

#### `social-og-cocktail-1200x630-v01.webp`

Default Cocktailseite.

### 24.2 Social Avatar

#### `social-avatar-joe-badge-512-v01.png`

Badge/Monogramm, kein komplexes Foto.

---

## 25. Prompt-Templates

### 25.1 Foto-Asset Prompt Template

```text
Create a high-resolution editorial food website asset for "Zum Fettigen Joe", a private culinary journal.

Subject:
<subject>

Composition:
<composition and perspective>

Mood:
Warm, premium, calm, personal culinary journal atmosphere.

Color palette:
Warm neutrals, wood, stone, linen, ceramic, glass and stainless steel. Subtle accents in BBQ red #B23A32 and petrol #2E7070. Avoid bright saturated colors.

Style:
Premium editorial food photography, natural warm light, refined but not sterile, shallow depth of field, clean composition, realistic textures.

Restrictions:
No readable text, no logos, no real brands, no recognizable real restaurant, no identifiable people, no watermark, no neon, no cartoon, no clutter.

Aspect ratio:
<ratio>

Output:
<filename>
```

### 25.2 Icon Prompt Template

```text
Create a clean SVG line icon for the "Zum Fettigen Joe" design system.

Icon meaning:
<meaning>

Style:
Minimal line icon, 24x24 grid, 2px stroke, rounded line caps and joins, no fill unless explicitly needed, currentColor-compatible, calm premium editorial UI style.

Restrictions:
No text, no logo, no decorative clutter, no gradients, no shadows.

Output filename:
<filename>
```

### 25.3 Pattern Prompt Template

```text
Create a subtle repeating background pattern for a premium culinary journal website.

Theme:
<theme>

Style:
Minimal, warm editorial, very low contrast, suitable behind text, inspired by paper/menu/card textures.

Color palette:
Warm gray #F5F3F1, border gray #DDD8D2, optional very subtle petrol #2E7070 or Joe red #B23A32 at low opacity.

Restrictions:
No readable text, no icons that dominate, no high contrast, no busy pattern.

Output:
<filename>
```

---

## 26. Priorisierung

### 26.1 Muss für MVP

1. `hero-home-editorial-restaurant-table-16x9-v01.webp`
2. `hero-home-mobile-restaurant-table-4x5-v01.webp`
3. `placeholder-restaurant-4x3-v01.webp`
4. `placeholder-review-4x3-v01.webp`
5. `placeholder-recipe-4x3-v01.webp`
6. `placeholder-cocktail-4x5-v01.webp`
7. `placeholder-equipment-4x3-v01.webp`
8. `icon-*` Basisicons für Navigation, Suche, Filter, Restaurant, Kritik, Rezept, Cocktail, Gerät, Link, Sammlung, Stern
9. `texture-warm-paper-grain-1x1-v01.webp`
10. `divider-petrol-thin-line-wide.svg`
11. `rating-stars-five-base.svg`
12. `social-og-default-1200x630-v01.webp`

### 26.2 Sollte für MVP

- Kategorie-Heros für Restaurants, Kritiken, Rezepte, Cocktails, Geräte
- Restaurant-Interieur-Platzhalter
- Bar-/Cocktail-Cards
- Zutaten-/Lieferanten-Bilder
- Status-Badges
- Stat-Icons

### 26.3 Kann später

- vollständiges Logo
- Monogramm und App Icons
- Dark-Mode-Varianten
- Open-Graph-Bilder je Contenttyp
- komplexere Patterns
- animierte Micro-Interactions
- Diagramm-Assets
- spezielle Sammlungsbilder

---

## 27. Asset Manifest Vorschlag

Später kann ein Manifest gepflegt werden:

```yaml
- id: hero_home_editorial_restaurant_table
  file: /assets/heroes/hero-home-editorial-restaurant-table-16x9-v01.webp
  type: hero
  aspect_ratio: "16:9"
  size: "2400x1350"
  status: planned
  usage:
    - home
  alt: "Warm beleuchteter Restauranttisch mit elegantem Gedeck."
  prompt_source: docs/design/ASSET_LIBRARY.md
```

Pfad:

```text
public/assets/manifest/assets.yaml
```

---

## 28. Qualitätscheck für generierte Bilder

Jedes generierte Bild wird geprüft gegen:

- passt zur Farbwelt?
- wirkt es hochwertig und ruhig?
- enthält es versehentlich Text?
- enthält es Logos oder erkennbare Marken?
- enthält es reale/identifizierbare Personen?
- ist das Essen realistisch?
- sind Hände/Besteck/Gläser plausibel?
- funktioniert es im geplanten Seitenverhältnis?
- ist genug ruhiger Raum für Overlay-Text vorhanden?
- passt es mobil und desktop?
- ist es nicht zu dunkel?
- ist es nicht zu generisch?
- passt es zu „Zum Fettigen Joe“ und „powered by umami“?

Nur Bilder, die diese Prüfung bestehen, sollten in die Asset Library übernommen werden.

---

## 29. Nächster Arbeitsschritt

Empfohlene nächste Schritte:

1. Dieses Dokument als `docs/design/ASSET_LIBRARY.md` ins Repo übernehmen.
2. Ordnerstruktur `docs/design/` und später `public/assets/` anlegen.
3. MVP-Asset-Liste aus Abschnitt 26.1 zuerst generieren.
4. Danach Kategorie-Heros und Platzhalterbilder ergänzen.
5. Icons als separate SVG-Linie konsistent erzeugen oder mit einer geprüften Icon Library abgleichen.
6. Asset Manifest anlegen und jedes finale Asset dort registrieren.
