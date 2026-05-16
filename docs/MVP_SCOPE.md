# MVP_SCOPE – joes-journal

## 1. Ziel von MVP 0.1

MVP 0.1 soll beweisen, dass `joes-journal` als private Gastro-Plattform technisch und fachlich funktioniert:

- Directus als Redaktionsmodus
- PostgreSQL als Datenbasis
- Astro als responsives Frontend
- Restaurant-Watchlist getrennt von Restaurantkritiken
- 5-Sterne-Bewertung prominent
- Links als eigene Objekte
- einfache Suche und Filter
- erste Statistiken
- private Bereitstellung über Cloudflare Access

## 2. In Scope

### Technisch

- Repo `joes-journal`
- pnpm Workspace
- Astro + TypeScript Frontend
- Directus Setup
- PostgreSQL
- Directus Schema Snapshot/Migrationen
- `.env.example`
- lokale Entwicklung auf `C:\projekte\joes-journal`
- VPS-Plan für `C:\joes-journal`
- erste Quality Gates
- später Playwright UX-Smokes

### Directus Collections MVP

- restaurants
- restaurant_reviews
- recipes
- cocktail_recipes
- ingredients
- suppliers
- equipment
- links
- collections
- tax_cuisines
- tax_locations
- tax_tags
- tax_ingredient_categories
- tax_equipment_categories
- tax_supplier_types

### Frontend-Seiten MVP

- Startseite
- Restaurantliste
- Restaurantdetail
- Kritikliste
- Kritikdetail
- Rezeptliste
- Rezeptdetail
- Cocktailliste
- Cocktaildetail
- Geräteliste
- Sammlungsliste / Sammlungsdetail
- Über Joe
- Suche

### UX MVP

- responsive Layouts
- Header + Burger Drawer mobil
- globale Suche
- Filter auf Listen
- Restaurantstatus sichtbar
- Sternebewertung prominent
- Watchlist-Restaurants ohne Kritik sinnvoll dargestellt
- einfache Statistik-Karten

### Statistik MVP

- Restaurants insgesamt
- Restaurants besucht
- Restaurants auf Watchlist
- Top-Städte und Regionen

## 3. Out of Scope für MVP 0.1

- öffentliche Freigabe für unbekannte Nutzer
- Docker-Betrieb
- semantische Suche
- Meilisearch/Pagefind
- Nutzerkommentare
- Social Features
- Tracking/Analytics
- Affiliate Links als Geschäftsmodell
- Mehrsprachigkeit
- komplexes SEO
- öffentliche API
- mobile App
- Kartendarstellung/Map
- automatisches Scraping
- LLM-gestützte Inhaltsgenerierung im Produktivsystem
- formale Ontologie in RDF/OWL

## 4. MVP-Testdaten

Für realistische Entwicklung:

- 8 Restaurants
  - 3 besucht mit Kritik
  - 5 Watchlist
- 3 Restaurantkritiken
- 3 Rezepte
- 3 Cocktails
  - mindestens 1 alkoholfrei
- 6 Zutaten/Getränke
- 3 Lieferanten
- 4 Geräte
  - 2 im Besitz
  - 2 Wunschliste
- 10 Links
- 3 Sammlungen
  - 2 manual_collection
  - 1 saved_view

## 5. Akzeptanzkriterien

MVP 0.1 ist abgeschlossen, wenn:

- Directus lokal läuft.
- PostgreSQL lokal läuft.
- Schema kann reproduzierbar angewendet werden.
- Testdaten können geladen werden.
- Astro startet lokal.
- Startseite rendert Daten aus Directus.
- Restaurantliste zeigt Watchlist und besuchte Restaurants.
- Kritikdetail zeigt 5-Sterne-Bewertung.
- Restaurantdetail zeigt Kritiken oder Watchlist-Status.
- Links werden als eigene Objekte angezeigt.
- Sammlungen zeigen manuelle und dynamische Inhalte.
- Suche findet Restaurants, Kritiken, Rezepte, Cocktails und Geräte.
- Mobile Navigation funktioniert.
- Statistik-Karten zeigen die vier MVP-Metriken.
- Keine Secrets im Repo.
- Grundlegende Tests/Smokes sind grün.

## 6. MVP Quality Gates

Mindestens:

```powershell
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Später zusätzlich:

```powershell
pnpm test:e2e
pnpm test:accessibility
```

## 7. MVP-Demo-Szenarien

### Szenario 1 – Restaurant auf Watchlist

1. Neues Restaurant in Directus anlegen.
2. Status `wishlist` setzen.
3. Frontend zeigt Restaurant in „Noch besuchen“.
4. Restaurantdetail zeigt keine Kritik, aber Watchlist-Notiz.

### Szenario 2 – Kritik schreiben

1. Bestehendes Restaurant auswählen.
2. Neue Kritik mit 5-Sterne-Bewertung anlegen.
3. Status auf `published` setzen.
4. Frontend zeigt Kritik prominent.
5. Restaurant zeigt verknüpfte Kritik.

### Szenario 3 – Link verknüpfen

1. Link zu Restaurant-Website anlegen.
2. Link mit Restaurant verbinden.
3. Frontend zeigt Link im Detail.

### Szenario 4 – Sammlung

1. Sammlung „Berlin besuchen“ als manual_collection anlegen.
2. Restaurants hinzufügen.
3. Frontend zeigt Sammlung.

### Szenario 5 – Statistik

1. Restaurants mit unterschiedlichen Status/Städten anlegen.
2. Statistikseite zeigt Counts und Top-Städte.
