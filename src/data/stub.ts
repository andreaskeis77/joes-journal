export type RestaurantStatus = "wishlist" | "planned" | "visited" | "reviewed";

export interface RestaurantStub {
  slug: string;
  name: string;
  city: string;
  region: string;
  cuisine: string;
  priceLevel: 1 | 2 | 3 | 4;
  priority: "hoch" | "mittel" | "niedrig";
  status: RestaurantStatus;
  statusLabel: string;
  tags: string[];
  image: string;
  website?: string;
  reservationUrl?: string;
  mapsUrl?: string;
  note: string;
  /** Slug der Kritik, falls vorhanden. */
  reviewSlug?: string;
}

export interface ReviewStub {
  slug: string;
  title: string;
  /** Slug des Restaurants. */
  restaurantSlug: string;
  visitedOn: string;
  rating: number;
  excerpt: string;
  body: string[];
  image: string;
  galleryImages: string[];
  status: "published";
}

export interface CategoryStub {
  slug: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface StatStub {
  label: string;
  value: number;
  icon: string;
}

export const restaurants: RestaurantStub[] = [
  {
    slug: "le-bistro-discret",
    name: "Le Bistro Discret",
    city: "Paris",
    region: "Île-de-France",
    cuisine: "Französisch · Bistro",
    priceLevel: 3,
    priority: "hoch",
    status: "reviewed",
    statusLabel: "Kritik vorhanden",
    tags: ["bistro", "klassik", "natural-wine"],
    image: "/assets/restaurants/restaurant-interior-bistro-window-4x3-v01.webp",
    website: "https://example.test/le-bistro-discret",
    reservationUrl: "https://example.test/reserve/le-bistro-discret",
    mapsUrl: "https://maps.example.test/paris/le-bistro-discret",
    note: "Bistro-Klassik mit ruhiger Hand. Karte ist kurz, Beurre Blanc präzise.",
    reviewSlug: "bistro-am-fenster-paris",
  },
  {
    slug: "vinothek-nord",
    name: "Vinothek Nord",
    city: "Hamburg",
    region: "Hamburg",
    cuisine: "Natural Wine · Kleine Teller",
    priceLevel: 2,
    priority: "mittel",
    status: "reviewed",
    statusLabel: "Kritik vorhanden",
    tags: ["wein", "kleine-teller", "abend"],
    image: "/assets/restaurants/restaurant-interior-casual-wine-bar-4x3-v01.webp",
    website: "https://example.test/vinothek-nord",
    mapsUrl: "https://maps.example.test/hamburg/vinothek-nord",
    note: "Karte zwingt zu Entscheidungen, die sich am Ende richtig anfühlen.",
    reviewSlug: "weinbar-im-norden",
  },
  {
    slug: "restaurant-ohne-namen",
    name: "Restaurant ohne Namen",
    city: "Berlin",
    region: "Berlin",
    cuisine: "Modern Europäisch",
    priceLevel: 4,
    priority: "hoch",
    status: "reviewed",
    statusLabel: "Kritik vorhanden",
    tags: ["fine-dining", "menü", "wein"],
    image: "/assets/restaurants/restaurant-interior-fine-dining-warm-4x3-v01.webp",
    website: "https://example.test/restaurant-ohne-namen",
    reservationUrl: "https://example.test/reserve/restaurant-ohne-namen",
    mapsUrl: "https://maps.example.test/berlin/restaurant-ohne-namen",
    note: "Sechs Gänge, kein lautes Plating, dafür präzises Würzen.",
    reviewSlug: "berlin-fine-dining-fruehlingsmenue",
  },
  {
    slug: "chefs-counter-muenchen",
    name: "Chef's Counter",
    city: "München",
    region: "Bayern",
    cuisine: "Modern Europäisch",
    priceLevel: 4,
    priority: "hoch",
    status: "planned",
    statusLabel: "Geplant",
    tags: ["chefs-table", "tasting"],
    image: "/assets/restaurants/restaurant-interior-open-kitchen-counter-4x3-v01.webp",
    website: "https://example.test/chefs-counter",
    note: "Sieben Plätze am Pass. Reservierungsfenster montags 10 Uhr.",
  },
  {
    slug: "terrasse-am-park",
    name: "Terrasse am Park",
    city: "Köln",
    region: "Nordrhein-Westfalen",
    cuisine: "Mediterran",
    priceLevel: 2,
    priority: "mittel",
    status: "wishlist",
    statusLabel: "Merkliste",
    tags: ["terrasse", "sommer"],
    image: "/assets/restaurants/restaurant-interior-terrace-evening-4x3-v01.webp",
    note: "Sommerabend-Kandidat. Karte wechselt wöchentlich.",
  },
  {
    slug: "bistro-am-fenster-berlin",
    name: "Bistro am Fenster",
    city: "Berlin",
    region: "Berlin",
    cuisine: "Französisch · Bistro",
    priceLevel: 2,
    priority: "hoch",
    status: "wishlist",
    statusLabel: "Merkliste",
    tags: ["bistro", "abend"],
    image: "/assets/restaurants/restaurant-interior-bistro-window-4x3-v01.webp",
    note: "Empfehlung aus dem Nachbarschaftsgespräch.",
  },
  {
    slug: "reservierte-tafel",
    name: "Reservierte Tafel",
    city: "Wien",
    region: "Wien",
    cuisine: "Österreichisch · Modern",
    priceLevel: 3,
    priority: "niedrig",
    status: "wishlist",
    statusLabel: "Merkliste",
    tags: ["wien", "modern"],
    image: "/assets/restaurants/restaurant-watchlist-empty-table-reserved-4x3-v01.webp",
    note: "Reservierung steht. Termin im Herbst.",
  },
  {
    slug: "watchlist-stadt-skizze",
    name: "Stadtskizze",
    city: "Lissabon",
    region: "Lisboa",
    cuisine: "Portugiesisch · Petiscos",
    priceLevel: 2,
    priority: "mittel",
    status: "wishlist",
    statusLabel: "Merkliste",
    tags: ["reise", "tapas"],
    image: "/assets/restaurants/restaurant-watchlist-map-notebook-4x3-v01.webp",
    note: "Reise-Liste Lissabon. Quelle: Notiz aus dem Café.",
  },
];

export const reviews: ReviewStub[] = [
  {
    slug: "berlin-fine-dining-fruehlingsmenue",
    title: "Frühlingsmenü mit ruhiger Hand",
    restaurantSlug: "restaurant-ohne-namen",
    visitedOn: "2026-04-18",
    rating: 4.5,
    excerpt:
      "Sechs Gänge, kein lautes Plating, dafür präzises Würzen und ein Service, der jeden Moment lesen konnte.",
    body: [
      "Schon der Auftakt – ein klarer Sud mit jungem Lauch – sagte alles: Hier wird Geschmack ernst genommen, ohne Geräusch zu machen. Sechs Gänge folgten, jeder mit einer ruhigen Idee, kein Gang als Pose.",
      "Höhepunkt war ein Stück Saibling, gerade so durch, mit einer Sauce, die nach gerösteter Butter, Sherry und Geduld schmeckte. Der Service hat dabei genau einmal nachgeschenkt – im richtigen Moment.",
      "Dessert war ein Rhabarber-Sorbet mit Olivenöl und etwas Pfeffer. Zurückhaltend, klar, präzise. Genau die Sorte Schluss, die man sich von einem guten Menü wünscht.",
    ],
    image: "/assets/reviews/review-dish-fine-dining-plate-4x3-v01.webp",
    galleryImages: [
      "/assets/reviews/review-service-table-detail-4x3-v01.webp",
      "/assets/reviews/review-dessert-plate-editorial-4x3-v01.webp",
      "/assets/reviews/review-wine-glass-table-4x3-v01.webp",
    ],
    status: "published",
  },
  {
    slug: "bistro-am-fenster-paris",
    title: "Bistro-Klassik, fein nachjustiert",
    restaurantSlug: "le-bistro-discret",
    visitedOn: "2026-03-02",
    rating: 4.0,
    excerpt:
      "Steak Frites in Form, eine Beurre Blanc, die nicht angeben muss, und eine Karte, die genau weiß, wann Schluss ist.",
    body: [
      "Die Karte umfasst zwölf Zeilen, davon zwei für Desserts. Das ist freundlich gemeint, denn sie nimmt einem die Qual der Wahl ab und gibt einem die Erlaubnis, einfach Steak Frites zu nehmen.",
      "Das Fleisch kam medium-rare, wie bestellt. Pommes dünn, doppelt frittiert, salzig genau richtig. Die Beurre Blanc zum Vorspeisenfisch war fein säuerlich und ohne den üblichen Schwall an Sahne.",
      "Es ist die Art Bistro, die einem das Gefühl gibt, dass das alles ganz normal sei – und genau das ist das Schwierige.",
    ],
    image: "/assets/reviews/review-service-table-detail-4x3-v01.webp",
    galleryImages: [
      "/assets/reviews/review-wine-glass-table-4x3-v01.webp",
      "/assets/reviews/review-after-dinner-table-4x3-v01.webp",
    ],
    status: "published",
  },
  {
    slug: "weinbar-im-norden",
    title: "Weinbar mit Haltung",
    restaurantSlug: "vinothek-nord",
    visitedOn: "2026-02-14",
    rating: 4.0,
    excerpt:
      "Kleine Teller, große Sorgfalt. Die Karte ist kurz und zwingt zu Entscheidungen, die sich am Ende alle richtig anfühlen.",
    body: [
      "Vier offene Weine, sechs kleine Teller, kein Hauptgang. Das klingt nach Tapas, ist aber leiser. Der erste Teller – fermentierter Sellerie mit Haselnuss – war so präzise austariert, dass man kurz nachdenken musste, ob es Vorspeise oder Dessert war.",
      "Der Wein im offenen Ausschank war ein Versuch wert: ein georgischer Skin Contact, ohne den üblichen Hardcore-Charakter. Dazu eine Forelle, kalt geräuchert, mit Crème fraîche und sehr dünner Gurke.",
      "Service freundlich, kompetent, ohne Vortrag. Eine Bar, die nicht beweisen muss, dass sie etwas drauf hat.",
    ],
    image: "/assets/reviews/review-after-dinner-table-4x3-v01.webp",
    galleryImages: [
      "/assets/reviews/review-dessert-plate-editorial-4x3-v01.webp",
      "/assets/reviews/review-wine-glass-table-4x3-v01.webp",
    ],
    status: "published",
  },
];

export const categories: CategoryStub[] = [
  {
    slug: "restaurants",
    title: "Restaurants",
    description: "Stammdaten, Watchlist und Besuche an einem Ort.",
    href: "/restaurants",
    image: "/assets/heroes/hero-restaurants-cool-dining-room-16x9-v01.webp",
  },
  {
    slug: "kritiken",
    title: "Kritiken",
    description: "Ehrliche, ruhige Restaurantkritiken mit klarer Bewertung.",
    href: "/kritiken",
    image: "/assets/heroes/hero-reviews-table-after-service-16x9-v01.webp",
  },
  {
    slug: "rezepte",
    title: "Rezepte",
    description: "Eigene Küche, mise en place, Methoden und Varianten.",
    href: "/rezepte",
    image: "/assets/heroes/hero-recipes-kitchen-counter-mise-en-place-16x9-v01.webp",
  },
  {
    slug: "cocktails",
    title: "Cocktails",
    description: "Drinks, Mocktails, Glas, Eis und Technik.",
    href: "/cocktails",
    image: "/assets/heroes/hero-cocktails-moody-bar-glassware-16x9-v01.webp",
  },
  {
    slug: "zutaten",
    title: "Zutaten",
    description: "Gewürze, Öle, saisonale Produkte und Bezugsquellen.",
    href: "/zutaten",
    image: "/assets/ingredients/ingredient-category-spices-herbs-4x3-v01.webp",
  },
  {
    slug: "geraete",
    title: "Geräte",
    description: "Was wirklich benutzt wird – und was auf die Wunschliste gehört.",
    href: "/geraete",
    image: "/assets/heroes/hero-equipment-kitchen-tools-still-life-16x9-v01.webp",
  },
];

const reviewedCount = restaurants.filter((r) => r.status === "reviewed").length;
const watchlistCount = restaurants.filter(
  (r) => r.status === "wishlist" || r.status === "planned",
).length;
const cityCount = new Set(restaurants.map((r) => r.city)).size;

export const stats: StatStub[] = [
  {
    label: "Restaurants insgesamt",
    value: restaurants.length,
    icon: "/assets/stats/stat-icon-restaurants-total.svg",
  },
  {
    label: "Mit Kritik",
    value: reviewedCount,
    icon: "/assets/stats/stat-icon-reviews-total.svg",
  },
  {
    label: "Auf der Watchlist",
    value: watchlistCount,
    icon: "/assets/stats/stat-icon-restaurants-watchlist.svg",
  },
  {
    label: "Top-Städte",
    value: cityCount,
    icon: "/assets/stats/stat-icon-top-cities.svg",
  },
];

export const quickChips: Array<{ label: string; href: string }> = [
  { label: "Neueste Kritiken", href: "/kritiken" },
  { label: "Watchlist", href: "/restaurants?status=wishlist" },
  { label: "Alkoholfreie Cocktails", href: "/cocktails" },
  { label: "BBQ & Grill", href: "/sammlungen" },
  { label: "Bar-Basics", href: "/sammlungen" },
];

/** Convenience accessors für Detailseiten. */
export const restaurantBySlug = new Map(restaurants.map((r) => [r.slug, r]));
export const reviewBySlug = new Map(reviews.map((r) => [r.slug, r]));

/** Sortierte Listen für Listenseiten. */
export const reviewsByDateDesc = [...reviews].sort((a, b) =>
  a.visitedOn < b.visitedOn ? 1 : -1,
);

/** Status-Reihenfolge für Listenanzeige. */
export const statusOrder: Record<RestaurantStatus, number> = {
  reviewed: 0,
  visited: 1,
  planned: 2,
  wishlist: 3,
};
