# DATA_MODEL – joes-journal

## 1. Zweck

Dieses Dokument beschreibt das fachliche Datenmodell für `joes-journal` als Grundlage für Directus Collections, PostgreSQL-Tabellen, Relationen, Filter, Statistik und spätere Agentenarbeit.

## 2. Kernprinzipien

1. **Restaurant und Kritik sind getrennte Objekte.** Ein Restaurant kann auf der Watchlist stehen, ohne dass es schon eine Kritik gibt.
2. **Links sind eigene Objekte.** Links werden nicht überall als lose URL-Felder verstreut, sondern zentral gepflegt und verknüpft.
3. **Sammlungen unterstützen zwei Modi:** `manual_collection` und `saved_view`.
4. **Bewertung erfolgt mit 5 Sternen wie Tripadvisor.** Keine Subscores im MVP. Bewertung prominent sichtbar.
5. **Taxonomien werden kontrolliert gepflegt.** Das verhindert Wildwuchs bei Städten, Küchen, Tags und Kategorien.
6. **Keine schwere formale Ontologie im MVP.** Aber eine leichte Domain-Ontologie wird dokumentiert.

## 3. Taxonomie und Ontologie

### 3.1 Taxonomie

Eine Taxonomie ist eine kontrollierte Begriffsliste oder Begriffshierarchie. Beispiele:

```text
Küchenrichtung: Französisch, Italienisch, Japanisch, BBQ, Fine Dining
Gerätekategorie: Grill, Barwerkzeug, Messer, Küchenmaschine, Pacojet
Ort: Berlin, München, Braunschweig, Bayern, Deutschland
```

Zweck:

- einheitliche Filter,
- saubere Statistik,
- keine Schreibvarianten,
- bessere Navigation,
- bessere Agentensteuerung.

Ohne Taxonomie entstehen Varianten wie `Japanisch`, `japanische Küche`, `Japanese`, `Sushi/Japanisch`, was Filter und Statistik beschädigt.

### 3.2 Ontologie

Eine Ontologie beschreibt zusätzlich Beziehungen und Bedeutung:

```text
Restaurant hat Kritiken.
Kritik gehört zu Restaurant.
Rezept verwendet Zutaten.
Cocktail verwendet Zutaten und Geräte.
Lieferant liefert Zutaten, Getränke oder Geräte.
Link kann mit mehreren Objekten verbunden sein.
Sammlung enthält kuratierte Objekte oder bildet eine gespeicherte Sicht ab.
```

Für MVP brauchen wir keine RDF/OWL-Ontologie, aber eine **leichte Domain-Ontologie**: dokumentierte Objektarten, Beziehungen, Statuswerte und kontrollierte Taxonomien.

## 4. Taxonomie-Collections

### `tax_cuisines`

Küchenrichtungen.

Felder: `name`, `slug`, `description`, `parent_cuisine`, `sort_order`, `is_active`.

Beispiele: Modern Regional, Französisch, Italienisch, Japanisch, Thai, BBQ, Fine Dining, Bistro, Steakhouse, Bar Food.

### `tax_locations`

Orte, Städte, Regionen, Länder.

Felder: `name`, `slug`, `type`, `parent_location`, `country_code`, `sort_order`, `is_active`.

`type`: `city`, `region`, `country`, `district`.

### `tax_tags`

Kontrollierte Tags.

Felder: `name`, `slug`, `scope`, `description`, `is_active`.

`scope`: `restaurant`, `review`, `recipe`, `cocktail`, `ingredient`, `equipment`, `general`.

### Weitere Taxonomien

- `tax_ingredient_categories`
- `tax_equipment_categories`
- `tax_supplier_types`

## 5. Statuswerte

### Restaurantstatus

```text
discovered       Entdeckt
wishlist         Merkliste
planned          Geplant
visited          Besucht
reviewed         Kritik vorhanden
revisit          Wieder besuchen
closed           Geschlossen
archived         Archiviert
ignore           Ignorieren
```

### Publikationsstatus

```text
idea             Idee
draft            Entwurf
internal         Intern
published        Veröffentlicht
archived         Archiviert
```

Im MVP bedeutet `published` nicht automatisch öffentlich, weil Cloudflare Access die Seite schützt.

### Gerätestatus

```text
owned            Im Besitz
wishlist         Wunschliste
watching         Beobachten
ordered          Bestellt
tested           Getestet
retired          Ausgemustert
sold             Verkauft
```

### Sammlungstyp

```text
manual_collection
saved_view
```

## 6. Kern-Collections

### `restaurants`

Stammdaten und Watchlist-Objekt.

Wichtige Felder:

- `name`
- `slug`
- `status`
- `priority`
- `short_note`
- `description`
- `location` → `tax_locations`
- `region` → `tax_locations`
- `country` → `tax_locations`
- `address`
- `website_url`
- `reservation_url`
- `maps_url`
- `cuisines` → `tax_cuisines` M2M
- `price_level`
- `main_image`
- `gallery`
- `tags` → `tax_tags` M2M
- `links` → `links`

### `restaurant_reviews`

Konkreter Besuchsbericht.

Wichtige Felder:

- `restaurant` → `restaurants`
- `title`
- `slug`
- `visit_date`
- `rating` 1–5 Sterne
- `summary`
- `body`
- `occasion`
- `visit_type`
- `status`
- `main_image`
- `gallery`
- `tags`
- `seo_title`
- `seo_description`

Bewertungsregel: 5 Sterne, prominent, keine Subscores. Halbe Sterne später prüfen.

### `recipes`

Kochrezepte.

Felder: `title`, `slug`, `status`, `summary`, `body`, `servings`, `prep_time_minutes`, `cook_time_minutes`, `difficulty`, `ingredients_text`, `steps`, `related_ingredients`, `related_equipment`, `source_note`, `main_image`, `gallery`, `tags`, `links`.

### `cocktail_recipes`

Cocktails und Mocktails.

Felder: `title`, `slug`, `status`, `alcohol_level`, `glassware`, `ice`, `technique`, `recipe_ml`, `ingredients`, `brands`, `garnish`, `taste_profile`, `instructions`, `summary`, `body`, `main_image`, `tags`, `related_ingredients`, `related_equipment`, `links`.

### `ingredients`

Lebensmittel, Zutaten und Getränke.

Felder: `name`, `slug`, `category`, `description`, `quality_notes`, `preferred_brands`, `alternatives`, `storage_notes`, `related_suppliers`, `related_recipes`, `related_cocktails`, `main_image`, `tags`, `links`.

### `suppliers`

Lieferanten und Bezugsquellen.

Felder: `name`, `slug`, `supplier_type`, `location`, `website`, `description`, `quality_rating`, `price_level`, `delivery_area`, `personal_notes`, `related_ingredients`, `related_equipment`, `links`, `tags`.

### `equipment`

Geräte, Utensilien, Tools und Wunschliste.

Felder: `name`, `slug`, `manufacturer`, `model`, `category`, `status`, `purchase_date`, `price`, `supplier`, `product_url`, `description`, `experience_notes`, `rating`, `related_recipes`, `related_cocktails`, `accessories`, `main_image`, `gallery`, `tags`, `links`.

### `links`

Links als eigene Objekte.

Felder: `title`, `url`, `link_type`, `description`, `source_name`, `reliability`, `status`, `tags`, `targets`.

`link_type`: `website`, `reservation`, `map`, `article`, `shop`, `video`, `recipe_source`, `product`, `social`, `other`.

`reliability`: `own`, `official`, `expert`, `journalistic`, `commercial`, `unknown`.

Für flexible Verknüpfung eignet sich Directus Many-to-Any. Wenn das im Setup zu unhandlich wird, werden explizite Junction Collections verwendet.

### `collections`

Kuratierte oder dynamische Sammlungen.

Felder: `title`, `slug`, `collection_type`, `description`, `status`, `hero_image`, `manual_items`, `saved_view_config`, `sort_order`, `tags`.

Beispiele: Berlin besuchen, alkoholfreie Cocktails, Pacojet-Rezepte, Bar-Basics, Geräte-Wunschliste.

## 7. Relationship Map

```text
restaurants 1 ── n restaurant_reviews
restaurants n ── m tax_cuisines
restaurants n ── m tax_tags
restaurants n ── m links
recipes n ── m ingredients
recipes n ── m equipment
cocktail_recipes n ── m ingredients
cocktail_recipes n ── m equipment
suppliers n ── m ingredients
suppliers n ── m equipment
collections n ── m any content object
links n ── m any content object
```

## 8. Slug-Regeln

- lowercase
- Umlaute ersetzen
- Leerzeichen zu Bindestrichen
- Sonderzeichen entfernen
- bei Konflikt Suffix

Beispiele:

```text
Überland, Braunschweig → ueberland-braunschweig
Lido 84 → lido-84
Yuzu Sour → yuzu-sour
```

## 9. MVP-Statistiken

- Restaurants insgesamt = `count(restaurants)`
- Restaurants besucht = Status in `visited`, `reviewed`, `revisit`
- Restaurants auf Watchlist = Status in `wishlist`, `planned`, `discovered`
- Top-Städte/Regionen = Gruppierung nach `location` / `region`

## 10. Offene Modellentscheidungen

| Thema | Status |
|---|---|
| Halbe Sterne | später prüfen |
| Rezeptzutaten strukturiert vs. Text | MVP textnah, später strukturieren |
| Cocktail-Zutaten als strukturierte Rows | sinnvoll, aber MVP pragmatisch starten |
| Polymorphe Links | Many-to-Any testen |
| Saved Views | JSON-Konfiguration definieren |
| Geo-/Kartendaten | später |
