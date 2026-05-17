# DIRECTUS_ADMIN_UX – joes-journal

## 1. Ziel

Directus ist der Redaktionsmodus von `joes-journal`.

Die Admin-Oberfläche soll nicht wie eine rohe Datenbank wirken, sondern wie ein persönliches Gastro-Redaktionsstudio.

Wichtig:

- Desktop-first für längere Pflege
- mobile nur für kleine Änderungen
- schnelle Eingabe neuer Objekte
- klare Feldgruppen
- gute Relationen
- gute Listenansichten
- Status sichtbar
- möglichst wenig Datenbankdenken

## 2. Rollen

| Rolle            | Zweck           |
| ---------------- | --------------- |
| Administrator    | volle Kontrolle |
| Editor / Owner   | Inhalte pflegen |
| Read-only Viewer | später optional |

Im MVP kann Administrator/Owner identisch sein. Rollen werden trotzdem dokumentiert, damit spätere Freigabe kontrolliert möglich ist.

## 3. Collection-Navigation

```text
Redaktion
  - Restaurants
  - Restaurantkritiken
  - Rezepte
  - Cocktailrezepte
  - Sammlungen

Wissen & Produkte
  - Zutaten
  - Lieferanten
  - Geräte
  - Links

Taxonomie
  - Küchen
  - Orte
  - Tags
  - Zutatenkategorien
  - Gerätekategorien
  - Lieferantentypen

Medien
  - Files
```

## 4. Listenansichten

### Restaurants

Spalten:

- Name
- Status
- Priorität
- Stadt
- Region
- Küche
- letzte Kritik
- aktualisiert

Gespeicherte Filter:

- Noch besuchen
- Geplant
- Besucht ohne Kritik
- Kritik vorhanden
- Wieder besuchen
- Berlin
- Hohe Priorität

### Restaurantkritiken

Spalten:

- Titel
- Restaurant
- Besuchsdatum
- Sterne
- Status
- Stadt
- aktualisiert

Gespeicherte Filter:

- Entwürfe
- Intern
- Veröffentlicht
- Neueste
- 5 Sterne
- Ohne Bild

### Weitere Listen

Rezepte, Cocktails, Geräte, Links und Sammlungen erhalten jeweils Status, Titel/Name, Kernkategorie, Tags und Aktualisierungsdatum als sichtbare Kernspalten.

## 5. Formularlayout Restaurants

Tabs:

### Allgemein

- Name
- Slug
- Status
- Priorität
- Kurznotiz
- Beschreibung

### Ort & Küche

- Stadt/Ort
- Region
- Land
- Adresse
- Küchenrichtungen
- Preisniveau
- Tags

### Links & Aktionen

- Website
- Reservierung
- Maps
- verknüpfte Links

### Medien

- Hauptbild
- Galerie

### Kritiken

- relationale Liste vorhandener Kritiken
- Button: neue Kritik anlegen

### Notizen

- warum interessant
- Empfehlung durch
- private Notizen

## 6. Formularlayout Restaurantkritiken

Tabs:

### Allgemein

- Titel
- Slug
- Restaurant
- Besuchsdatum
- Besuchstyp
- Status
- Sternebewertung

### Artikel

- Kurzfazit
- Haupttext
- Fazit

### Medien

- Hero-Bild
- Galerie

### Tags & Verknüpfungen

- Tags
- verknüpfte Links
- Sammlungen

### SEO / Veröffentlichung

- SEO Title
- SEO Description
- Veröffentlichungsdatum
- interne Notizen

## 7. Formularlayout Links

Tabs:

### Link

- Titel
- URL
- Linktyp
- Status
- Quelle
- Beschreibung

### Verknüpfungen

- Zielobjekte über Many-to-Any oder Junctions
- Tags

### Qualität

- Reliability
- letzte Prüfung
- Notizen

## 8. Formularlayout Sammlungen

Tabs:

### Allgemein

- Titel
- Slug
- Sammlungstyp
- Beschreibung
- Status
- Hero-Bild

### Manuelle Sammlung

- manuelle Items
- Reihenfolge

### Saved View

- Ziel-Collection
- Filter-Konfiguration
- Sortierung
- Limit

### Darstellung

- Kartenlayout
- Introtext
- Tags

## 9. Display Templates

```text
Restaurant: {{name}} · {{location.name}} · {{status}}
Kritik: {{title}} · {{rating}}★ · {{restaurant.name}}
Zutat: {{name}} · {{category.name}}
Gerät: {{manufacturer}} {{model}} · {{status}}
Link: {{title}} · {{link_type}}
```

## 10. Workflows

Restaurant:

```text
Entdeckt → Merkliste → Geplant → Besucht → Kritik vorhanden → Wieder besuchen / Archiviert
```

Kritik:

```text
Idee → Entwurf → Intern → Veröffentlicht → Archiviert
```

Gerät:

```text
Interessant → Wunschliste → Beobachten → Gekauft → Im Einsatz → Ausgemustert
```

## 11. Admin Dashboard MVP

Das Directus Dashboard soll zeigen:

- Restaurants insgesamt
- Restaurants besucht
- Restaurants auf Watchlist
- Top-Städte/Regionen
- letzte bearbeitete Kritiken
- Restaurants ohne Kritik
- Geräte auf Wunschliste

## 12. UX-Regeln für Directus

- Keine endlosen Formulare ohne Tabs.
- Pflichtfelder sparsam, aber klar.
- Statusfelder weit oben.
- Relationen immer mit gutem Display Template.
- Listenansichten müssen echte Arbeit unterstützen.
- Default-Sortierung: zuletzt geändert oder relevante Priorität.
- Hilfetexte bei komplexen Feldern.
- Slugs generieren, aber manuell überschreibbar.
- Mobile nur für kleine Änderungen optimieren.

## 13. Akzeptanzkriterien

Directus Admin ist MVP-fähig, wenn:

- ein neues Restaurant in unter 2 Minuten angelegt werden kann,
- eine Kritik mit Restaurantrelation intuitiv angelegt werden kann,
- Restaurantstatus und Priorität schnell geändert werden können,
- Fotos einfach hochgeladen werden können,
- Links als eigene Objekte verknüpft werden können,
- Listenansichten nützliche Filter bieten,
- keine Collection wie eine rohe SQL-Tabelle wirkt.
