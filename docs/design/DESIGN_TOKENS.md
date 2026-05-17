# DESIGN_TOKENS – joes-journal

## 1. Zweck

Dieses Dokument definiert die visuellen Basistokens für das Astro-Frontend von `joes-journal`.

Die Tokens sind Grundlage für CSS, Komponenten und spätere Designsystem-Arbeit.

## 2. Markenlogik

```text
Joe = Charakter, Wärme, Essen, Haltung
umami = Kompetenz, Qualität, Ruhe
```

## 3. Farben

### Core Palette

| Token                  | Farbe       | Hex       | Verwendung                               |
| ---------------------- | ----------- | --------- | ---------------------------------------- |
| `--color-joe-red`      | BBQ-Rot     | `#B23A32` | Primäraktionen, aktive Zustände, Akzente |
| `--color-umami-petrol` | Petrol      | `#2E7070` | Links, sekundäre Aktionen, Signatur      |
| `--color-bg-warm`      | Warmgrau    | `#F5F3F1` | Seitenhintergrund                        |
| `--color-surface`      | Weiß        | `#FFFFFF` | Cards, Content-Flächen                   |
| `--color-footer`       | Hellgrau    | `#EDEBE9` | Footer, abgesetzte Flächen               |
| `--color-text`         | Dunkelgrau  | `#222222` | Haupttext                                |
| `--color-text-muted`   | Mittelgrau  | `#5F5A56` | Metadaten                                |
| `--color-border`       | Warmes Grau | `#DDD8D2` | Rahmen, Trennlinien                      |

### Semantik

| Token                | Wert                        |
| -------------------- | --------------------------- |
| `--color-primary`    | `var(--color-joe-red)`      |
| `--color-secondary`  | `var(--color-umami-petrol)` |
| `--color-background` | `var(--color-bg-warm)`      |
| `--color-card`       | `var(--color-surface)`      |
| `--color-link`       | `var(--color-umami-petrol)` |
| `--color-danger`     | `#9F2D24`                   |
| `--color-success`    | `#2F6F4E`                   |
| `--color-warning`    | `#B87514`                   |

## 4. Typografie

### Fonts MVP

| Zweck          | Font                    |
| -------------- | ----------------------- |
| Headlines      | Poppins                 |
| Body           | Inter                   |
| UI             | Inter                   |
| Logo/Wortmarke | eigenes Branding später |

CSS Tokens:

```css
--font-heading: "Poppins", system-ui, sans-serif;
--font-body: "Inter", system-ui, sans-serif;
--font-ui: "Inter", system-ui, sans-serif;
```

### Schriftgrößen

| Token              | Mobile | Desktop | Verwendung               |
| ------------------ | -----: | ------: | ------------------------ |
| `--font-size-xs`   |   12px |    12px | Labels, kleine Metadaten |
| `--font-size-sm`   |   14px |    14px | Meta, Tags               |
| `--font-size-base` |   17px |    18px | Fließtext                |
| `--font-size-lg`   |   20px |    21px | Intro, Card Text         |
| `--font-size-xl`   |   24px |    28px | H3                       |
| `--font-size-2xl`  |   30px |    38px | H2                       |
| `--font-size-3xl`  |   36px |    52px | H1/Hero                  |

### Line Height

```css
--line-tight: 1.12;
--line-heading: 1.18;
--line-body: 1.62;
--line-meta: 1.42;
```

## 5. Spacing

8px-basierte Skala:

| Token       | Wert |
| ----------- | ---: |
| `--space-1` |  4px |
| `--space-2` |  8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |
| `--space-9` | 96px |

## 6. Layout

### Breakpoints

| Token     |   Wert | Zweck             |
| --------- | -----: | ----------------- |
| `--bp-sm` |  600px | großes Smartphone |
| `--bp-md` |  900px | Tablet            |
| `--bp-lg` | 1200px | Laptop/Desktop    |
| `--bp-xl` | 1440px | großer Desktop    |

### Max Widths

| Token           |   Wert |
| --------------- | -----: |
| `--max-page`    | 1200px |
| `--max-content` |  760px |
| `--max-detail`  | 1080px |
| `--max-wide`    | 1320px |

## 7. Radius und Schatten

| Token         | Wert | Verwendung         |
| ------------- | ---: | ------------------ |
| `--radius-sm` |  6px | kleine Chips       |
| `--radius-md` | 10px | Buttons            |
| `--radius-lg` | 14px | Cards              |
| `--radius-xl` | 22px | Hero/Feature Cards |

```css
--shadow-card: 0 8px 24px rgba(34, 34, 34, 0.08);
--shadow-card-hover: 0 14px 34px rgba(34, 34, 34, 0.14);
--shadow-panel: 0 18px 48px rgba(34, 34, 34, 0.12);
```

## 8. Buttons und Cards

Primary Button:

- Hintergrund: Joe Rot
- Text: Weiß
- Mindesthöhe: 44px
- Radius: `--radius-md`

Secondary Button:

- Hintergrund: Weiß
- Border: warmes Grau
- Text: Dunkelgrau oder Petrol

Card-Regeln:

- Bild oben
- Metadaten klar
- Status sichtbar
- Bewertung prominent bei Kritiken
- gesamte Card darf klickbar sein, interne Actions müssen zugänglich bleiben

## 9. Rating

Bewertung:

- 5 Sterne wie Tripadvisor
- prominent sichtbar
- keine Subscores
- numerischer Wert zusätzlich anzeigen

Beispiel:

```text
★★★★☆ 4.0 / 5
```

## 10. Fokuszustände

```css
--focus-ring: 0 0 0 3px rgba(46, 112, 112, 0.35);
--focus-outline-color: var(--color-umami-petrol);
```

Fokus muss sichtbar sein bei Navigation, Buttons, Cards, Links, Formularfeldern, Filterchips und Drawer Controls.

## 11. Hero

Hero-Regel:

- starke Bildstimmung
- dunkles Overlay für Lesbarkeit
- kurzer Claim
- globale Suche
- zwei CTAs: Neueste Kritiken und Restaurants entdecken

## 12. Offene Designentscheidungen

- finale Logo/Wortmarke
- finales Rating Icon Set
- genaue Kontrastwerte für Statusfarben
- Dark Mode später prüfen
- finaler Fotostil nach ersten echten Bildern
