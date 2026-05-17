export interface ReviewStub {
  slug: string;
  title: string;
  restaurant: string;
  city: string;
  visitedOn: string;
  rating: number;
  excerpt: string;
  image: string;
  status: "published";
}

export interface RestaurantStub {
  slug: string;
  name: string;
  city: string;
  cuisine: string;
  status: "wishlist" | "visited" | "reviewed";
  statusLabel: string;
  image: string;
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

export const reviews: ReviewStub[] = [
  {
    slug: "berlin-fine-dining-fruehlingsmenue",
    title: "Frühlingsmenü mit ruhiger Hand",
    restaurant: "Restaurant ohne Namen",
    city: "Berlin",
    visitedOn: "2026-04-18",
    rating: 4.5,
    excerpt:
      "Sechs Gänge, kein lautes Plating, dafür präzises Würzen und ein Service, der jeden Moment lesen konnte.",
    image: "/assets/reviews/review-dish-fine-dining-plate-4x3-v01.webp",
    status: "published",
  },
  {
    slug: "bistro-am-fenster-paris",
    title: "Bistro-Klassik, fein nachjustiert",
    restaurant: "Le Bistro Discret",
    city: "Paris",
    visitedOn: "2026-03-02",
    rating: 4.0,
    excerpt:
      "Steak Frites in Form, eine Beurre Blanc, die nicht angeben muss, und eine Karte, die genau weiß, wann Schluss ist.",
    image: "/assets/reviews/review-service-table-detail-4x3-v01.webp",
    status: "published",
  },
  {
    slug: "weinbar-im-norden",
    title: "Weinbar mit Haltung",
    restaurant: "Vinothek Nord",
    city: "Hamburg",
    visitedOn: "2026-02-14",
    rating: 4.0,
    excerpt:
      "Kleine Teller, große Sorgfalt. Die Karte ist kurz und zwingt zu Entscheidungen, die sich am Ende alle richtig anfühlen.",
    image: "/assets/reviews/review-after-dinner-table-4x3-v01.webp",
    status: "published",
  },
];

export const restaurants: RestaurantStub[] = [
  {
    slug: "watchlist-bistro-window",
    name: "Bistro am Fenster",
    city: "Berlin",
    cuisine: "Französisch · Bistro",
    status: "wishlist",
    statusLabel: "Merkliste",
    image: "/assets/restaurants/restaurant-interior-bistro-window-4x3-v01.webp",
  },
  {
    slug: "watchlist-open-kitchen",
    name: "Chef’s Counter",
    city: "München",
    cuisine: "Modern Europäisch",
    status: "wishlist",
    statusLabel: "Geplant",
    image: "/assets/restaurants/restaurant-interior-open-kitchen-counter-4x3-v01.webp",
  },
  {
    slug: "visited-wine-bar",
    name: "Casual Wine Bar",
    city: "Hamburg",
    cuisine: "Natural Wine",
    status: "reviewed",
    statusLabel: "Kritik vorhanden",
    image: "/assets/restaurants/restaurant-interior-casual-wine-bar-4x3-v01.webp",
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

export const stats: StatStub[] = [
  {
    label: "Restaurants insgesamt",
    value: 42,
    icon: "/assets/stats/stat-icon-restaurants-total.svg",
  },
  {
    label: "Davon besucht",
    value: 27,
    icon: "/assets/stats/stat-icon-restaurants-visited.svg",
  },
  {
    label: "Auf der Watchlist",
    value: 15,
    icon: "/assets/stats/stat-icon-restaurants-watchlist.svg",
  },
  {
    label: "Top-Städte",
    value: 6,
    icon: "/assets/stats/stat-icon-top-cities.svg",
  },
];

export const quickChips: Array<{ label: string; href: string }> = [
  { label: "Neueste Kritiken", href: "/kritiken" },
  { label: "Watchlist", href: "/restaurants?status=wishlist" },
  { label: "Alkoholfreie Cocktails", href: "/cocktails?alkoholfrei=1" },
  { label: "BBQ & Grill", href: "/sammlungen/bbq-grill-notes" },
  { label: "Bar-Basics", href: "/sammlungen/bar-basics" },
];
