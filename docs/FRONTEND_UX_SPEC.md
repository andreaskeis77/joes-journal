# FRONTEND_UX_SPEC – joes-journal

## 1. Ziel

Das Astro-Frontend ist die Lese-, Such- und Stöberoberfläche von `joes-journal`.

Es soll auf Smartphone und Laptop funktionieren:

- mobil: schnell lesen, suchen, stöbern, nachschlagen
- Desktop: komfortabel lesen, filtern, Listen auswerten, Statistiken ansehen

## 2. Hauptnavigation

Desktop:

```text
Zum Fettigen Joe | Journal | Restaurants | Kritiken | Rezepte | Cocktails | Zutaten | Geräte | Sammlungen | Über Joe | Suche
```

Mobile:

- kompakter Header
- Burger Drawer
- prominente Suche
- keine Bottom Navigation im MVP

## 3. Startseite

Ziel:

- Marke sichtbar machen
- aktuelle Inhalte zeigen
- Suche prominent anbieten
- zentrale Einstiege ermöglichen
- persönliche Gastro-Welt sichtbar machen

Aufbau:

```text
Header
Hero mit Bild, Claim, Suche, CTAs
Quick Chips
Neueste Kritiken
Restaurants entdecken / Watchlist-Auszug
Rezepte & Cocktails Highlights
Geräte / Zutaten / Lieferanten Teaser
Mini-Statistiken
About Joe / powered by umami
Footer
```

Hero:

```text
Zum Fettigen Joe
Ein persönliches Journal über Restaurants, Küche, Cocktails und guten Geschmack.
[Globale Suche]
[Neueste Kritiken] [Restaurants entdecken]
```

Alternative Kurzclaim:

```text
Ehrliche Kritiken. Gute Küche. Guter Geschmack.
```

## 4. Globale Suche

Placeholder:

```text
Suche nach Restaurant, Stadt, Rezept, Zutat, Cocktail, Gerät…
```

MVP-Verhalten:

- einfache Suche über relevante Directus-Felder
- Ergebnisse nach Inhaltstyp gruppiert
- schnelle Ergebnisliste
- kein semantisches Ranking im MVP

Ergebnisgruppen:

- Restaurants
- Kritiken
- Rezepte
- Cocktails
- Zutaten
- Geräte
- Lieferanten
- Sammlungen
- Links

## 5. Restaurantliste

Zweck:

- alle Restaurants navigieren
- Watchlist und besuchte Restaurants unterscheiden
- nach Ort, Status und Küche filtern

Filter MVP:

- Suche
- Status
- Stadt/Region
- Küche
- Preisniveau
- Priorität

Views:

```text
Alle
Noch besuchen
Besucht
Mit Kritik
Nach Priorität
```

Restaurant Card:

- Bild
- Name
- Stadt/Region
- Küche
- Statusbadge
- Preisniveau
- Bewertung, falls Kritik vorhanden

## 6. Restaurantdetail

Stammdatenseite für ein Restaurant.

Bausteine:

- Header mit Name, Ort, Küche, Status
- Hauptbild
- Kurznotiz
- Website / Reservieren / Maps
- Preisniveau
- Priorität
- Tags
- vorhandene Kritiken
- verknüpfte Links
- Notizen
- verwandte Restaurants oder Sammlungen

Wichtige UX-Regel: Wenn ein Restaurant noch keine Kritik hat, darf die Seite nicht leer wirken. Sie zeigt dann Watchlist-Status, warum gespeichert, Priorität, Quellen/Links und geplante Notizen.

## 7. Kritikliste und Kritikdetail

### Kritikliste

Filter:

- Suche
- Sterne
- Stadt/Region
- Küche
- Besuchsdatum/Jahr
- Status

Sortierung:

- neueste zuerst
- beste Bewertung
- Stadt
- Restaurantname

### Kritikdetail

Desktop:

```text
Hero-Bild
Breadcrumb
Titel
Restaurant / Ort / Besuchsdatum
★★★★☆ 4.0/5
Kurzfazit
Artikeltext
Galerie
Links / Details
Verwandte Kritiken
```

Mobile:

```text
Hero-Bild
Titel
Rating
Kurzfazit
Metadaten kompakt
Artikelabschnitte
Galerie
```

## 8. Rezepte

Liste Filter:

- Suche
- Kategorie/Tags
- Zutaten
- Geräte
- Schwierigkeit
- Zeit

Detail:

- Titel
- Bild
- Kurzbeschreibung
- Portionen
- Zeit
- Zutaten
- Schritte
- Geräte
- Bezugsquellen
- Varianten
- Notizen

## 9. Cocktails

Liste Filter:

- alkoholisch / alkoholfrei
- Technik
- Glas
- Basiskategorie
- Geschmack
- Zutaten

Detail:

- Drink-Foto
- Rezeptur in ml
- Glas
- Eis
- Technik
- Zutaten/Marken
- Garnitur
- Zubereitung
- Geschmacksprofil
- Varianten

## 10. Geräte

Liste Filter:

- Status
- Kategorie
- Hersteller
- Bewertung/Priorität

Detail:

- Bild
- Hersteller/Modell
- Status
- Kategorie
- Produktlink
- Händler
- Erfahrungsnotizen
- Zubehör
- verknüpfte Rezepte/Cocktails

## 11. Sammlungen

Sammlungen sind zentrale Stöberseiten.

Typen:

- `manual_collection`: redaktionell kuratiert
- `saved_view`: dynamisch über Filter

Beispiele:

- Berlin besuchen
- Noch nicht besuchte Restaurants mit hoher Priorität
- Alkoholfreie Cocktails
- Pacojet
- Bar-Basics
- Geräte-Wunschliste

## 12. Mobile UX

Regeln:

- einspaltige Cards
- Header + Burger Drawer
- prominente Suche
- Filter als Drawer/Bottom Sheet
- große Touchflächen
- keine komplexen Tabellen
- Inhaltsblöcke klar getrennt
- externe Aktionen leicht erreichbar

Mobile Filter:

- Button: „Filter & Sortieren“
- Drawer mit Gruppen
- aktive Filter als Chips
- Button: „X Ergebnisse anzeigen“
- Reset: „Filter zurücksetzen“

## 13. Desktop UX

Desktop nutzt Raum für:

- 2–3 Spalten Card-Grids
- Filter-Sidebar
- Metadaten-Sidebar auf Detailseiten
- Statistik-Karten
- größere Bildergalerien

## 14. Komponenten MVP

- Header
- MobileDrawer
- HeroSearch
- SearchBar
- FilterChips
- FilterDrawer
- RestaurantCard
- ReviewCard
- RecipeCard
- CocktailCard
- EquipmentCard
- RatingStars
- StatusBadge
- StatCard
- LinkList
- ImageGallery
- Footer
- EmptyState
- ErrorState

## 15. Empty States

Beispiele:

```text
Noch keine Kritik vorhanden.
Dieses Restaurant steht aktuell auf deiner Merkliste.
```

```text
Keine Restaurants gefunden.
Passe Filter oder Suchbegriff an.
```

## 16. Accessibility

- korrekte Überschriftenstruktur
- Fokus sichtbar
- Buttons/Links semantisch korrekt
- Alt-Texte für inhaltliche Bilder
- Rating nicht nur über Sternfarbe
- mobile Touchflächen ausreichend groß
- Drawer per Tastatur bedienbar

## 17. Playwright UX-Smokes später

- Startseite lädt
- mobile Navigation öffnet
- Suche liefert Ergebnisse
- Restaurantliste filtert Watchlist
- Kritikdetail zeigt Sternebewertung
- Restaurant ohne Kritik zeigt Watchlist-State
- Admin-Link nicht öffentlich zugänglich ohne Access
