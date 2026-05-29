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

/**
 * Editorialer Lebenszyklus einer Kritik (entspricht CONTENT_STATUS_OPTIONS in
 * directus/bootstrap/schema/status.ts). Nur `published` darf im statischen
 * Output landen – siehe derive() und den Loader-Filter in client.ts.
 */
export type ReviewStatus = "draft" | "internal" | "published" | "archived";

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
  status: ReviewStatus;
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

// -----------------------------------------------------------------------------
// Recipes / Cocktails / Equipment / Ingredients / Suppliers / Collections / Links
// -----------------------------------------------------------------------------

export type RecipeDifficulty = "leicht" | "mittel" | "anspruchsvoll";

export interface RecipeIngredient {
  amount: string;
  item: string;
  /** Slug der Zutat, falls verknüpft. */
  ingredientSlug?: string;
}

export interface RecipeStub {
  slug: string;
  title: string;
  image: string;
  summary: string;
  servings: number;
  prepMin: number;
  cookMin: number;
  difficulty: RecipeDifficulty;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  equipmentSlugs: string[];
  notes?: string;
}

export type CocktailType = "alkoholisch" | "alkoholfrei";

export interface CocktailPour {
  amount: string;
  item: string;
  ingredientSlug?: string;
}

export interface CocktailStub {
  slug: string;
  name: string;
  image: string;
  type: CocktailType;
  glass: string;
  ice: string;
  technique: string;
  flavorProfile: string;
  pours: CocktailPour[];
  garnish: string;
  preparation: string[];
  variants?: string[];
}

export type EquipmentStatus = "owned" | "wishlist";

export interface EquipmentStub {
  slug: string;
  name: string;
  image: string;
  category: string;
  status: EquipmentStatus;
  statusLabel: string;
  manufacturer?: string;
  model?: string;
  productUrl?: string;
  note: string;
  linkedRecipes: string[];
  linkedCocktails: string[];
}

export interface IngredientStub {
  slug: string;
  name: string;
  image: string;
  category: string;
  note: string;
  supplierSlugs: string[];
}

export interface SupplierStub {
  slug: string;
  name: string;
  type: string;
  city: string;
  website?: string;
  note: string;
}

export type CollectionType = "manual" | "saved_view";

export interface CollectionStub {
  slug: string;
  title: string;
  image: string;
  type: CollectionType;
  typeLabel: string;
  description: string;
  restaurantSlugs: string[];
  recipeSlugs: string[];
  cocktailSlugs: string[];
  equipmentSlugs: string[];
}

export interface LinkStub {
  url: string;
  label: string;
  source: string;
  /** Optionale Verknüpfungen über Slug. */
  restaurantSlug?: string;
  recipeSlug?: string;
  cocktailSlug?: string;
  equipmentSlug?: string;
}

export const ingredients: IngredientStub[] = [
  {
    slug: "olivenoel-extra-vergine",
    name: "Olivenöl Extra Vergine",
    image: "/assets/ingredients/ingredient-category-oil-vinegar-ceramic-4x3-v01.webp",
    category: "Öle & Essige",
    note: "Tagesöl, intensiv, frisch gepresst. Für Vorspeisen und Saucen.",
    supplierSlugs: ["mittelmeer-import"],
  },
  {
    slug: "graues-meersalz",
    name: "Graues Meersalz",
    image: "/assets/ingredients/ingredient-category-spices-herbs-4x3-v01.webp",
    category: "Salz & Gewürz",
    note: "Sel gris aus der Bretagne. Grob, mineralisch, für Fleisch und Gemüse.",
    supplierSlugs: ["mittelmeer-import"],
  },
  {
    slug: "thymian-frisch",
    name: "Thymian frisch",
    image: "/assets/ingredients/ingredient-category-spices-herbs-4x3-v01.webp",
    category: "Kräuter",
    note: "Saisonal aus der Region. Für Schmorgerichte, Saucen, Olivenmarinade.",
    supplierSlugs: ["wochenmarkt-stadtmitte"],
  },
  {
    slug: "bio-zitronen",
    name: "Bio-Zitronen",
    image: "/assets/ingredients/ingredient-category-citrus-syrup-glass-4x3-v01.webp",
    category: "Obst",
    note: "Unbehandelt, für Schale und Saft. Wichtig für Cocktails und Saucen.",
    supplierSlugs: ["bio-laden-um-die-ecke"],
  },
  {
    slug: "ingwer-frisch",
    name: "Ingwer frisch",
    image: "/assets/ingredients/ingredient-drink-ginger-lime-4x3-v01.webp",
    category: "Wurzeln",
    note: "Für Mocktails, Tee, Ginger Shrubs. Glatte Knolle, nicht runzelig.",
    supplierSlugs: ["bio-laden-um-die-ecke"],
  },
  {
    slug: "saisongemuese",
    name: "Saisongemüse",
    image: "/assets/ingredients/ingredient-category-vegetables-market-4x3-v01.webp",
    category: "Gemüse",
    note: "Wochenmarkt-Auswahl. Was gerade reif ist, kommt in die Pfanne.",
    supplierSlugs: ["wochenmarkt-stadtmitte"],
  },
];

export const suppliers: SupplierStub[] = [
  {
    slug: "wochenmarkt-stadtmitte",
    name: "Wochenmarkt Stadtmitte",
    type: "Markt",
    city: "Berlin",
    note: "Mittwoch und Samstag. Stände für Gemüse, Kräuter und Eier. Bar bezahlen, früh kommen.",
  },
  {
    slug: "mittelmeer-import",
    name: "Mittelmeer Import",
    type: "Feinkost",
    city: "Hamburg",
    website: "https://example.test/mittelmeer-import",
    note: "Online-Versand. Öle, Salze, Konserven, einzelne Pasta-Sorten.",
  },
  {
    slug: "bio-laden-um-die-ecke",
    name: "Bio-Laden um die Ecke",
    type: "Bio-Laden",
    city: "Berlin",
    note: "Tägliche Versorgung. Zitrus, Ingwer, einzelne Spezialitäten.",
  },
];

export const equipment: EquipmentStub[] = [
  {
    slug: "chefs-knife",
    name: "Kochmesser 21 cm",
    image: "/assets/equipment/equipment-card-knife-set-4x3-v01.webp",
    category: "Messer",
    status: "owned",
    statusLabel: "Im Besitz",
    note: "Hauptmesser. Carbonstahl, regelmäßig geschärft. Für 90 % aller Schneidearbeiten.",
    linkedRecipes: ["fruehlingsgemuese-pfanne", "saiblings-filet-beurre-blanc"],
    linkedCocktails: [],
  },
  {
    slug: "cast-iron-pan",
    name: "Gusseisenpfanne 28 cm",
    image: "/assets/equipment/equipment-card-cast-iron-pan-4x3-v01.webp",
    category: "Pfannen",
    status: "owned",
    statusLabel: "Im Besitz",
    note: "Schwarz, eingebrannt, ofengeeignet. Für Steaks, Schmoren, Sauce-Reduktionen.",
    linkedRecipes: ["fruehlingsgemuese-pfanne"],
    linkedCocktails: [],
  },
  {
    slug: "kamado-grill",
    name: "Keramik-Kamado Grill",
    image: "/assets/equipment/equipment-card-kamado-grill-4x3-v01.webp",
    category: "Grill",
    status: "wishlist",
    statusLabel: "Wunschliste",
    productUrl: "https://example.test/kamado-grill",
    note: "Für indirektes Grillen, niedrige Temperaturen, Räuchern. Größere Investition.",
    linkedRecipes: [],
    linkedCocktails: [],
  },
  {
    slug: "bar-tools-set",
    name: "Bar-Tools Set",
    image: "/assets/equipment/equipment-card-bar-tools-4x3-v01.webp",
    category: "Bar",
    status: "wishlist",
    statusLabel: "Wunschliste",
    note: "Jigger, Rührglas, Barlöffel, Strainer. Aktuell improvisiert, soll ersetzt werden.",
    linkedRecipes: [],
    linkedCocktails: ["highball-zitrus", "old-fashioned-klassisch", "ginger-lime-mocktail"],
  },
];

export const recipes: RecipeStub[] = [
  {
    slug: "fruehlingsgemuese-pfanne",
    title: "Frühlingsgemüse aus der Pfanne",
    image: "/assets/recipes/recipe-card-mise-en-place-vegetables-4x3-v01.webp",
    summary:
      "Junge Karotten, Bohnen und Zuckerschoten, kurz gebraten, mit Zitrus und Olivenöl. Beilage oder schneller Hauptgang.",
    servings: 2,
    prepMin: 10,
    cookMin: 8,
    difficulty: "leicht",
    tags: ["frühling", "schnell", "vegetarisch"],
    ingredients: [
      { amount: "200 g", item: "junge Karotten", ingredientSlug: "saisongemuese" },
      { amount: "150 g", item: "grüne Bohnen", ingredientSlug: "saisongemuese" },
      { amount: "100 g", item: "Zuckerschoten", ingredientSlug: "saisongemuese" },
      { amount: "2 EL", item: "Olivenöl extra vergine", ingredientSlug: "olivenoel-extra-vergine" },
      { amount: "1", item: "Bio-Zitrone (Schale + 1 EL Saft)", ingredientSlug: "bio-zitronen" },
      { amount: "1 Prise", item: "Meersalz", ingredientSlug: "graues-meersalz" },
      { amount: "ein paar Zweige", item: "Thymian", ingredientSlug: "thymian-frisch" },
    ],
    steps: [
      "Gemüse waschen, putzen und in mundgerechte Stücke schneiden. Karotten der Länge nach halbieren.",
      "Gusseisenpfanne auf mittlerer bis hoher Hitze erhitzen, Olivenöl zugeben.",
      "Karotten zuerst in die Pfanne, 3 Minuten anbraten. Bohnen und Zuckerschoten dazu, weitere 3–4 Minuten unter Schwenken garen.",
      "Hitze reduzieren, Thymian, Salz und Zitronenschale zugeben. Mit Zitronensaft abschmecken und sofort servieren.",
    ],
    equipmentSlugs: ["chefs-knife", "cast-iron-pan"],
    notes:
      "Funktioniert auch mit Spargel, Erbsen oder dicken Bohnen. Wichtig: nicht zu lang garen, das Gemüse soll Biss behalten.",
  },
  {
    slug: "saiblings-filet-beurre-blanc",
    title: "Saiblingsfilet mit Beurre Blanc",
    image: "/assets/recipes/recipe-card-pasta-sauce-pan-4x3-v01.webp",
    summary:
      "Klassische Sauce mit Saiblingsfilet, gerade so durchgegart. Kein Zauber – nur Aufmerksamkeit und gute Butter.",
    servings: 2,
    prepMin: 15,
    cookMin: 20,
    difficulty: "mittel",
    tags: ["fisch", "klassisch", "abend"],
    ingredients: [
      { amount: "2", item: "Saiblingsfilets (à 150 g)" },
      { amount: "150 g", item: "kalte Butter, in Würfeln" },
      { amount: "100 ml", item: "trockener Weißwein" },
      { amount: "2 EL", item: "weißer Wermut" },
      { amount: "1", item: "Schalotte, fein gewürfelt" },
      { amount: "1 EL", item: "Olivenöl", ingredientSlug: "olivenoel-extra-vergine" },
      { amount: "nach Bedarf", item: "Meersalz", ingredientSlug: "graues-meersalz" },
    ],
    steps: [
      "Schalotte mit Wein und Wermut in einem kleinen Topf auf die Hälfte einreduzieren.",
      "Hitze reduzieren, kalte Butterwürfel nach und nach unter ständigem Schwenken einarbeiten. Die Sauce darf nicht kochen.",
      "Saiblingsfilets salzen, Olivenöl in der Pfanne erhitzen, Fisch auf der Hautseite knusprig braten, einmal kurz wenden.",
      "Fisch direkt mit Beurre Blanc servieren. Idealerweise mit jungen Erbsen oder Saisongemüse.",
    ],
    equipmentSlugs: ["chefs-knife"],
    notes:
      "Die Sauce verträgt keinen starken Hitzeschub. Wer mag, kann am Ende mit ein paar Tropfen Zitronensaft frisch nachjustieren.",
  },
  {
    slug: "geschmorte-tomaten-rosmarin",
    title: "Lange geschmorte Tomaten mit Rosmarin",
    image: "/assets/recipes/recipe-method-sauce-reduction-pan-4x3-v01.webp",
    summary:
      "Tomaten, langsam im Ofen geschmort, mit Knoblauch und Olivenöl. Für Brot, Pasta oder als Beilage.",
    servings: 4,
    prepMin: 10,
    cookMin: 90,
    difficulty: "leicht",
    tags: ["sommer", "vegan", "vorratsgericht"],
    ingredients: [
      { amount: "800 g", item: "reife Tomaten (gemischt)" },
      { amount: "4 EL", item: "Olivenöl", ingredientSlug: "olivenoel-extra-vergine" },
      { amount: "4 Zehen", item: "Knoblauch, leicht angedrückt" },
      { amount: "2 Zweige", item: "Rosmarin" },
      { amount: "1 TL", item: "Meersalz", ingredientSlug: "graues-meersalz" },
    ],
    steps: [
      "Ofen auf 140 °C Umluft vorheizen. Tomaten halbieren und mit der Schnittfläche nach oben in eine ofenfeste Form legen.",
      "Olivenöl, Knoblauch, Rosmarin und Salz darüber verteilen.",
      "Für 75–90 Minuten schmoren lassen, bis die Tomaten zusammenfallen und am Rand karamellisieren.",
      "Mit etwas Öl in einem Schraubglas hält sich das Ganze 3–4 Tage im Kühlschrank.",
    ],
    equipmentSlugs: [],
    notes:
      "Sehr gut auf geröstetem Brot mit Ricotta. Oder als Basis für eine schnelle Pasta-Sauce.",
  },
];

export const cocktails: CocktailStub[] = [
  {
    slug: "highball-zitrus",
    name: "Zitrus Highball",
    image: "/assets/cocktails/cocktail-card-highball-citrus-4x5-v01.webp",
    type: "alkoholisch",
    glass: "Highball",
    ice: "lang, kalt – idealerweise gefrorener Stick",
    technique: "build im Glas",
    flavorProfile: "frisch, zitrusbetont, leicht herb",
    pours: [
      { amount: "50 ml", item: "Gin (London Dry)" },
      { amount: "20 ml", item: "Zitronensaft, frisch", ingredientSlug: "bio-zitronen" },
      { amount: "10 ml", item: "Zuckersirup" },
      { amount: "120 ml", item: "Tonic Water, kalt" },
    ],
    garnish: "Zitronenzeste, kurz über das Glas gerieben",
    preparation: [
      "Glas mit klaren, kalten Eiswürfeln füllen.",
      "Gin, Zitronensaft und Sirup direkt ins Glas geben.",
      "Mit Tonic auffüllen und einmal vorsichtig mit dem Barlöffel anheben.",
      "Zitronenzeste über das Glas reiben, kurz an den Rand drücken und ins Glas geben.",
    ],
    variants: [
      "Mit Grapefruit statt Zitrone, etwas trockener.",
      "Ohne Alkohol: Gin durch Verjus oder klaren Tee ersetzen.",
    ],
  },
  {
    slug: "old-fashioned-klassisch",
    name: "Old Fashioned, klassisch",
    image: "/assets/cocktails/cocktail-card-rocks-glass-ice-4x5-v01.webp",
    type: "alkoholisch",
    glass: "Tumbler",
    ice: "ein großer klarer Würfel",
    technique: "rühren",
    flavorProfile: "warm, holzig, leicht süß, lange Länge",
    pours: [
      { amount: "60 ml", item: "Bourbon oder Rye" },
      { amount: "5 ml", item: "Zuckersirup" },
      { amount: "2 Dashes", item: "Angostura Bitters" },
      { amount: "1 Dash", item: "Orange Bitters" },
    ],
    garnish: "Orangenzeste, kurz angedrückt",
    preparation: [
      "Whiskey, Sirup und Bitters im Rührglas mit Eis verdünnen, ca. 25 Sekunden rühren.",
      "Über einen großen klaren Würfel in den Tumbler abseihen.",
      "Orangenzeste über das Glas drücken, kurz am Rand abstreifen, ins Glas geben.",
    ],
    variants: [
      "Mit Mezcal statt Whiskey für eine rauchige Variante.",
      "Mit Ahornsirup für mehr Tiefe in der Süße.",
    ],
  },
  {
    slug: "ginger-lime-mocktail",
    name: "Ginger Lime Mocktail",
    image: "/assets/cocktails/cocktail-card-mocktail-ginger-lime-4x5-v01.webp",
    type: "alkoholfrei",
    glass: "Highball",
    ice: "klare Eiswürfel",
    technique: "shake & strain",
    flavorProfile: "frisch, scharf, hell, kein Restzucker",
    pours: [
      { amount: "30 ml", item: "frischer Ingwersaft", ingredientSlug: "ingwer-frisch" },
      { amount: "25 ml", item: "Limettensaft" },
      { amount: "15 ml", item: "Zuckersirup, mild" },
      { amount: "120 ml", item: "Sodawasser, kalt" },
    ],
    garnish: "Limettenrad und ein Streifen Ingwer",
    preparation: [
      "Ingwer-, Limettensaft und Sirup in einen Shaker mit Eis geben, kurz kräftig schütteln.",
      "Doppelt ins gefüllte Highball abseihen.",
      "Mit Sodawasser auffüllen, kurz anheben, garnieren.",
    ],
    variants: [
      "Mit dünn aufgeschnittener Salatgurke für mehr Frische.",
      "Mit Tonic statt Soda für leicht bittere Tiefe.",
    ],
  },
];

export const collections: CollectionStub[] = [
  {
    slug: "berlin-besuchen",
    title: "Berlin besuchen",
    image: "/assets/collections/collection-card-bar-basics-4x3-v01.webp",
    type: "manual",
    typeLabel: "Manuelle Sammlung",
    description:
      "Restaurants in Berlin, die in den nächsten Monaten dran sind. Watchlist mit Priorität.",
    restaurantSlugs: ["restaurant-ohne-namen", "bistro-am-fenster-berlin"],
    recipeSlugs: [],
    cocktailSlugs: [],
    equipmentSlugs: [],
  },
  {
    slug: "bbq-grill-notes",
    title: "BBQ & Grill Notes",
    image: "/assets/collections/collection-card-bbq-grill-notes-4x3-v01.webp",
    type: "manual",
    typeLabel: "Manuelle Sammlung",
    description:
      "Equipment, Methoden und Rezepte rund um Holzkohle und Glut. Kein Tagesgeschäft, aber Lieblingsthema.",
    restaurantSlugs: [],
    recipeSlugs: ["geschmorte-tomaten-rosmarin"],
    cocktailSlugs: [],
    equipmentSlugs: ["kamado-grill"],
  },
  {
    slug: "watchlist-mit-hoher-prio",
    title: "Watchlist mit hoher Priorität",
    image: "/assets/collections/collection-card-wishlist-tools-4x3-v01.webp",
    type: "saved_view",
    typeLabel: "Dynamische Sicht",
    description:
      "Alle Restaurants auf der Merkliste mit Priorität „hoch“. Dynamisch aus den Stammdaten gefiltert.",
    restaurantSlugs: [],
    recipeSlugs: [],
    cocktailSlugs: [],
    equipmentSlugs: [],
  },
];

export const links: LinkStub[] = [
  {
    url: "https://example.test/le-bistro-discret",
    label: "Le Bistro Discret – Website",
    source: "le-bistro-discret.example.test",
    restaurantSlug: "le-bistro-discret",
  },
  {
    url: "https://example.test/reserve/le-bistro-discret",
    label: "Reservierung Le Bistro Discret",
    source: "reserve.example.test",
    restaurantSlug: "le-bistro-discret",
  },
  {
    url: "https://example.test/restaurant-ohne-namen",
    label: "Restaurant ohne Namen – Karte und Reservierung",
    source: "restaurant-ohne-namen.example.test",
    restaurantSlug: "restaurant-ohne-namen",
  },
  {
    url: "https://example.test/chefs-counter",
    label: "Chef's Counter – Reservierungsfenster",
    source: "chefs-counter.example.test",
    restaurantSlug: "chefs-counter-muenchen",
  },
  {
    url: "https://example.test/kamado-grill",
    label: "Kamado Grill – Produktseite",
    source: "kamado-grill.example.test",
    equipmentSlug: "kamado-grill",
  },
  {
    url: "https://example.test/mittelmeer-import",
    label: "Mittelmeer Import – Shop",
    source: "mittelmeer-import.example.test",
  },
  {
    url: "https://example.test/beurre-blanc-grundlagen",
    label: "Beurre Blanc Grundlagen – Lesenotiz",
    source: "lesenotizen.example.test",
    recipeSlug: "saiblings-filet-beurre-blanc",
  },
  {
    url: "https://example.test/cast-iron-care",
    label: "Cast Iron Care – Reinigung und Pflege",
    source: "lesenotizen.example.test",
    equipmentSlug: "cast-iron-pan",
  },
  {
    url: "https://example.test/old-fashioned-history",
    label: "Old Fashioned – kurze Geschichte",
    source: "barnotizen.example.test",
    cocktailSlug: "old-fashioned-klassisch",
  },
  {
    url: "https://example.test/wochenmarkt-berlin",
    label: "Wochenmarkt Berlin Stadtmitte – Standliste",
    source: "wochenmarkt.example.test",
  },
];

// -----------------------------------------------------------------------------
// Maps / sorted accessors
// -----------------------------------------------------------------------------

/** Convenience accessors für Detailseiten. */
export const restaurantBySlug = new Map(restaurants.map((r) => [r.slug, r]));
export const reviewBySlug = new Map(reviews.map((r) => [r.slug, r]));
export const recipeBySlug = new Map(recipes.map((r) => [r.slug, r]));
export const cocktailBySlug = new Map(cocktails.map((c) => [c.slug, c]));
export const equipmentBySlug = new Map(equipment.map((e) => [e.slug, e]));
export const ingredientBySlug = new Map(ingredients.map((i) => [i.slug, i]));
export const supplierBySlug = new Map(suppliers.map((s) => [s.slug, s]));
export const collectionBySlug = new Map(collections.map((c) => [c.slug, c]));

/** Sortierte Listen für Listenseiten. */
export const reviewsByDateDesc = [...reviews].sort((a, b) => (a.visitedOn < b.visitedOn ? 1 : -1));

/** Status-Reihenfolge für Listenanzeige. */
export const statusOrder: Record<RestaurantStatus, number> = {
  reviewed: 0,
  visited: 1,
  planned: 2,
  wishlist: 3,
};

// -----------------------------------------------------------------------------
// Stats helpers (für /statistik)
// -----------------------------------------------------------------------------

export interface CityStat {
  city: string;
  count: number;
}

export const topCities: CityStat[] = (() => {
  const counts = new Map<string, number>();
  for (const r of restaurants) {
    counts.set(r.city, (counts.get(r.city) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
})();

export const ownedEquipmentCount = equipment.filter((e) => e.status === "owned").length;
export const wishlistEquipmentCount = equipment.filter((e) => e.status === "wishlist").length;
export const alcoholFreeCocktailCount = cocktails.filter((c) => c.type === "alkoholfrei").length;

// -----------------------------------------------------------------------------
// Search index für /suche (client-side fuzzy search)
// -----------------------------------------------------------------------------

export type SearchKind =
  | "restaurant"
  | "review"
  | "recipe"
  | "cocktail"
  | "equipment"
  | "ingredient"
  | "supplier"
  | "collection"
  | "link";

export interface SearchEntry {
  kind: SearchKind;
  kindLabel: string;
  title: string;
  href: string;
  snippet: string;
  image?: string;
  searchText: string;
}

function s(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export const searchIndex: SearchEntry[] = [
  ...restaurants.map<SearchEntry>((r) => ({
    kind: "restaurant",
    kindLabel: "Restaurant",
    title: r.name,
    href: `/restaurants/${r.slug}`,
    snippet: `${r.city} · ${r.cuisine}`,
    image: r.image,
    searchText: s(r.name, r.city, r.region, r.cuisine, r.note, ...r.tags),
  })),
  ...reviews.map<SearchEntry>((rv) => {
    const rest = restaurantBySlug.get(rv.restaurantSlug);
    return {
      kind: "review",
      kindLabel: "Kritik",
      title: rv.title,
      href: `/kritiken/${rv.slug}`,
      snippet: rest ? `${rest.name} · ${rest.city}` : "",
      image: rv.image,
      searchText: s(rv.title, rv.excerpt, rest?.name, rest?.city, ...rv.body),
    };
  }),
  ...recipes.map<SearchEntry>((rc) => ({
    kind: "recipe",
    kindLabel: "Rezept",
    title: rc.title,
    href: `/rezepte/${rc.slug}`,
    snippet: `${rc.difficulty} · ${rc.servings} Portionen`,
    image: rc.image,
    searchText: s(rc.title, rc.summary, ...rc.tags, ...rc.ingredients.map((i) => i.item)),
  })),
  ...cocktails.map<SearchEntry>((co) => ({
    kind: "cocktail",
    kindLabel: co.type === "alkoholfrei" ? "Cocktail · alkoholfrei" : "Cocktail",
    title: co.name,
    href: `/cocktails/${co.slug}`,
    snippet: `${co.glass} · ${co.technique}`,
    image: co.image,
    searchText: s(
      co.name,
      co.type,
      co.glass,
      co.technique,
      co.flavorProfile,
      ...co.pours.map((p) => p.item),
    ),
  })),
  ...equipment.map<SearchEntry>((eq) => ({
    kind: "equipment",
    kindLabel: "Gerät",
    title: eq.name,
    href: `/geraete/${eq.slug}`,
    snippet: `${eq.category} · ${eq.statusLabel}`,
    image: eq.image,
    searchText: s(eq.name, eq.category, eq.manufacturer, eq.model, eq.note, eq.statusLabel),
  })),
  ...ingredients.map<SearchEntry>((ing) => ({
    kind: "ingredient",
    kindLabel: "Zutat",
    title: ing.name,
    href: `/zutaten#${ing.slug}`,
    snippet: ing.category,
    image: ing.image,
    searchText: s(ing.name, ing.category, ing.note),
  })),
  ...suppliers.map<SearchEntry>((sup) => ({
    kind: "supplier",
    kindLabel: "Lieferant",
    title: sup.name,
    href: `/zutaten#${sup.slug}`,
    snippet: `${sup.type} · ${sup.city}`,
    searchText: s(sup.name, sup.type, sup.city, sup.note),
  })),
  ...collections.map<SearchEntry>((col) => ({
    kind: "collection",
    kindLabel: col.typeLabel,
    title: col.title,
    href: `/sammlungen/${col.slug}`,
    snippet: col.description,
    image: col.image,
    searchText: s(col.title, col.description, col.typeLabel),
  })),
  ...links.map<SearchEntry>((l) => ({
    kind: "link",
    kindLabel: "Link",
    title: l.label,
    href: l.url,
    snippet: l.source,
    searchText: s(l.label, l.source),
  })),
];
