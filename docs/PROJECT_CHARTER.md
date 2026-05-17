# PROJECT_CHARTER – joes-journal

## 1. Projektauftrag

`joes-journal` ist das technische Projekt für die private Website **Zum Fettigen Joe**.

Die Website ist ein persönliches, redaktionell gepflegtes Gastro-Journal mit strukturierter Datenbasis. Sie soll Restaurantkritiken, Restaurant-Watchlists, Rezepte, Cocktails, Zutaten, Lieferanten, Geräte, Wunschlisten, Links und Sammlungen abbilden.

Die Website ist primär für den Owner gedacht. Öffentliche Freigaben sind später selektiv möglich, aber nicht Ziel des MVP.

## 2. Produktidentität

```text
Zum Fettigen Joe
Ein persönliches Journal über Restaurants, Küche, Cocktails und guten Geschmack.
powered by umami
```

### Markenrollen

| Rolle            | Bedeutung                                                            |
| ---------------- | -------------------------------------------------------------------- |
| Zum Fettigen Joe | sichtbare Hauptmarke, kulinarisches Alter Ego, humorvoll, persönlich |
| umami            | dezente Kompetenz- und Qualitätssignatur                             |
| joes-journal     | technischer Repo-/Projektname                                        |

## 3. Zielbild

Die Plattform soll drei Dinge verbinden:

1. **Editorial Journal**  
   Hochwertige, gut lesbare Restaurantkritiken, Rezepte und Cocktailtexte.

2. **Persönliches Gastro-Wiki**  
   Strukturierte Informationen über Restaurants, Zutaten, Lieferanten, Geräte und Links.

3. **Redaktions- und Datenstudio**  
   Komfortabler Desktop-Editor über Directus mit sauberem Datenmodell, Statusfeldern, Relationen und späteren Auswertungen.

## 4. Hauptnutzer

| Nutzer             | Rolle                                       |
| ------------------ | ------------------------------------------- |
| Andreas            | Owner, Redakteur, Admin, Leser              |
| Vertraute Personen | später optional lesender Zugriff            |
| Öffentlichkeit     | nicht Ziel des MVP; später selektiv möglich |

## 5. Kern-Use-Cases

### Lesen und Stöbern

- Neue Restaurantkritiken lesen
- Restaurants nach Stadt, Region, Küche oder Status durchsuchen
- Rezepte und Cocktails finden
- Zutaten, Bezugsquellen und Geräte nachschlagen
- Sammlungen erkunden
- Mini-Statistiken ansehen

### Redaktionsmodus

- Restaurant auf Watchlist setzen
- Restaurantkritik schreiben
- Rezept erfassen
- Cocktailrezept erfassen
- Zutat oder Getränk dokumentieren
- Lieferant speichern
- Gerät oder Wunschlistenobjekt pflegen
- Links als eigene Objekte sammeln und verknüpfen
- Bilder hochladen
- Inhalte als Entwurf, intern oder veröffentlicht markieren

### Analyse und Statistik

MVP-Statistiken:

- Restaurants insgesamt
- Restaurants besucht
- Restaurants auf Watchlist
- Top-Städte und Regionen

Später:

- Kritiken pro Jahr
- Küchenrichtungen
- Favoriten
- Cocktailzutaten
- Gerätebestand
- Lieferanten nach Kategorie

## 6. Verbindliche Leitentscheidungen

| Thema             | Entscheidung                                                                   |
| ----------------- | ------------------------------------------------------------------------------ |
| Architektur       | Directus + PostgreSQL + Astro + Cloudflare Access + Tailscale                  |
| VPS-Betrieb       | Native Windows für MVP, Docker später neu bewerten                             |
| Sichtbarkeit      | zuerst privat, später selektiv öffentlich                                      |
| Domain Frontend   | `zumfettigenjoe.com`                                                           |
| Domain Admin      | `admin.zumfettigenjoe.com`                                                     |
| Bewertung         | 5 Sterne wie Tripadvisor, prominent, keine Subscores                           |
| Links             | eigene Collection `links`, mit Objekten verknüpfbar                            |
| Sammlungen        | `manual_collection` und `saved_view`                                           |
| Suche MVP         | Directus/PostgreSQL-Suche + Filter                                             |
| Typografie MVP    | Poppins für Headlines, Inter für Body/UI                                       |
| Mobile Navigation | Header + Burger Drawer + prominente Suche                                      |
| Hero              | starke Bildstimmung, kurzer Claim, globale Suche, zwei CTAs                    |
| Tracking          | kein Tracking im MVP                                                           |
| Bilder            | eigene oder klar lizenzierte Bilder; externe Bilder nicht ungeprüft übernehmen |

## 7. Nicht-Ziele im MVP

- Kein öffentlicher SEO-Blog für unbekannte Öffentlichkeit
- Kein offenes Kommentar- oder Community-System
- Kein Social Login
- Keine komplexe semantische Suche
- Keine Vollautomatisierung von Inhalten durch LLMs
- Kein Docker-Betrieb im MVP
- Keine Native Mobile App
- Kein umfassendes Analytics-/Tracking-System
- Kein Affiliate- oder Werbesystem
- Keine öffentliche API

## 8. Erfolgskriterien für MVP 0.1

MVP 0.1 ist erfolgreich, wenn:

- Directus mit PostgreSQL auf dem DEV-LAPTOP läuft.
- Die Kern-Collections existieren.
- Erste Testdaten erfasst werden können.
- Astro die wichtigsten Seiten aus Directus rendert.
- Frontend und Admin privat erreichbar sind.
- Mobile und Desktop Layouts grundsätzlich funktionieren.
- Bewertungssterne prominent dargestellt werden.
- Restaurants ohne Kritik als Watchlist-Objekte sichtbar sind.
- Restaurantkritiken mit Restaurant-Stammdaten verknüpft sind.
- Links als eigene Objekte modelliert sind.
- Mindestens die vier MVP-Statistiken angezeigt werden.
- Quality Gates und erste UX-Smokes grün sind.

## 9. Arbeitsmodus

Das Projekt soll später mit Claude/Agentenunterstützung umgesetzt werden. Dafür gilt:

- Repo-Dokumente sind Source of Truth, nicht Chatverlauf.
- Jede größere Änderung erfolgt als Tranche.
- Jede Tranche hat Scope, Akzeptanzkriterien und Tests.
- Agenten dürfen keine Secrets erzeugen oder einchecken.
- Agenten ändern nicht mehrere Architekturachsen gleichzeitig.
- Nach jeder Tranche laufen die passenden Gates.
- Dokumentation wird als Teil der Änderung aktualisiert.
