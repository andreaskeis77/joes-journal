/**
 * Pure derivation of the data bundle consumed by Astro pages.
 *
 * Both the stub source and the Directus source produce the same RawData
 * shape; `derive()` turns it into the Maps, sorted lists, search index
 * and counts used by components.
 */
import type {
  RestaurantStub,
  ReviewStub,
  ArticleStub,
  RecipeStub,
  CocktailStub,
  EquipmentStub,
  IngredientStub,
  SupplierStub,
  CollectionStub,
  LinkStub,
  CityStat,
  SearchEntry,
  StatStub,
  RestaurantStatus,
} from "./stub";

export interface RawData {
  restaurants: RestaurantStub[];
  reviews: ReviewStub[];
  articles: ArticleStub[];
  recipes: RecipeStub[];
  cocktails: CocktailStub[];
  equipment: EquipmentStub[];
  ingredients: IngredientStub[];
  suppliers: SupplierStub[];
  collections: CollectionStub[];
  links: LinkStub[];
}

export interface DerivedBundle extends RawData {
  restaurantBySlug: Map<string, RestaurantStub>;
  reviewBySlug: Map<string, ReviewStub>;
  articleBySlug: Map<string, ArticleStub>;
  recipeBySlug: Map<string, RecipeStub>;
  cocktailBySlug: Map<string, CocktailStub>;
  equipmentBySlug: Map<string, EquipmentStub>;
  ingredientBySlug: Map<string, IngredientStub>;
  supplierBySlug: Map<string, SupplierStub>;
  collectionBySlug: Map<string, CollectionStub>;

  reviewsByDateDesc: ReviewStub[];
  articlesByDateDesc: ArticleStub[];
  topCities: CityStat[];

  ownedEquipmentCount: number;
  wishlistEquipmentCount: number;
  alcoholFreeCocktailCount: number;

  stats: StatStub[];
  searchIndex: SearchEntry[];
}

export const statusOrder: Record<RestaurantStatus, number> = {
  reviewed: 0,
  visited: 1,
  planned: 2,
  wishlist: 3,
};

function joinLower(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function buildSearchIndex(
  raw: RawData,
  restaurantBySlug: Map<string, RestaurantStub>,
): SearchEntry[] {
  return [
    ...raw.restaurants.map<SearchEntry>((r) => ({
      kind: "restaurant",
      kindLabel: "Restaurant",
      title: r.name,
      href: `/restaurants/${r.slug}`,
      snippet: `${r.city} · ${r.cuisine}`,
      image: r.image,
      searchText: joinLower(r.name, r.city, r.region, r.cuisine, r.note, ...r.tags),
    })),
    ...raw.reviews.map<SearchEntry>((rv) => {
      const rest = restaurantBySlug.get(rv.restaurantSlug);
      return {
        kind: "review",
        kindLabel: "Kritik",
        title: rv.title,
        href: `/kritiken/${rv.slug}`,
        snippet: rest ? `${rest.name} · ${rest.city}` : "",
        image: rv.image,
        searchText: joinLower(
          rv.title,
          rv.excerpt,
          rest?.name,
          rest?.city,
          rv.body.replace(/<[^>]+>/g, " "),
        ),
      };
    }),
    ...raw.articles.map<SearchEntry>((a) => ({
      kind: "article",
      kindLabel: "Journal",
      title: a.title,
      href: `/journal/${a.slug}`,
      snippet: a.eyebrow ?? "Journal",
      image: a.image,
      searchText: joinLower(
        a.title,
        a.summary,
        a.eyebrow,
        ...a.tags,
        a.body.replace(/<[^>]+>/g, " "),
      ),
    })),
    ...raw.recipes.map<SearchEntry>((rc) => ({
      kind: "recipe",
      kindLabel: "Rezept",
      title: rc.title,
      href: `/rezepte/${rc.slug}`,
      snippet: `${rc.difficulty} · ${rc.servings} Portionen`,
      image: rc.image,
      searchText: joinLower(rc.title, rc.summary, ...rc.tags, ...rc.ingredients.map((i) => i.item)),
    })),
    ...raw.cocktails.map<SearchEntry>((co) => ({
      kind: "cocktail",
      kindLabel: co.type === "alkoholfrei" ? "Cocktail · alkoholfrei" : "Cocktail",
      title: co.name,
      href: `/cocktails/${co.slug}`,
      snippet: `${co.glass} · ${co.technique}`,
      image: co.image,
      searchText: joinLower(
        co.name,
        co.type,
        co.glass,
        co.technique,
        co.flavorProfile,
        ...co.pours.map((p) => p.item),
      ),
    })),
    ...raw.equipment.map<SearchEntry>((eq) => ({
      kind: "equipment",
      kindLabel: "Gerät",
      title: eq.name,
      href: `/geraete/${eq.slug}`,
      snippet: `${eq.category} · ${eq.statusLabel}`,
      image: eq.image,
      searchText: joinLower(
        eq.name,
        eq.category,
        eq.manufacturer,
        eq.model,
        eq.note,
        eq.statusLabel,
      ),
    })),
    ...raw.ingredients.map<SearchEntry>((ing) => ({
      kind: "ingredient",
      kindLabel: "Zutat",
      title: ing.name,
      href: `/zutaten#${ing.slug}`,
      snippet: ing.category,
      image: ing.image,
      searchText: joinLower(ing.name, ing.category, ing.note),
    })),
    ...raw.suppliers.map<SearchEntry>((sup) => ({
      kind: "supplier",
      kindLabel: "Lieferant",
      title: sup.name,
      href: `/zutaten#${sup.slug}`,
      snippet: `${sup.type} · ${sup.city}`,
      searchText: joinLower(sup.name, sup.type, sup.city, sup.note),
    })),
    ...raw.collections.map<SearchEntry>((col) => ({
      kind: "collection",
      kindLabel: col.typeLabel,
      title: col.title,
      href: `/sammlungen/${col.slug}`,
      snippet: col.description,
      image: col.image,
      searchText: joinLower(col.title, col.description, col.typeLabel),
    })),
    ...raw.links.map<SearchEntry>((l) => ({
      kind: "link",
      kindLabel: "Link",
      title: l.label,
      href: l.url,
      snippet: l.source,
      searchText: joinLower(l.label, l.source),
    })),
  ];
}

export function derive(raw: RawData): DerivedBundle {
  // Editorial gate: only published reviews may reach the static output.
  // This is the source-agnostic second layer behind the Directus loader's
  // server-side filter — it also protects the stub source and any future
  // source. Drafts/internal/archived reviews are dropped here before they
  // can populate maps, lists, the search index or the exported `reviews`.
  const publishedReviews = raw.reviews.filter((r) => r.status === "published");
  const publishedArticles = raw.articles.filter((a) => a.status === "published");
  const data: RawData = { ...raw, reviews: publishedReviews, articles: publishedArticles };

  const restaurantBySlug = new Map(data.restaurants.map((r) => [r.slug, r]));
  const reviewBySlug = new Map(publishedReviews.map((r) => [r.slug, r]));
  const articleBySlug = new Map(publishedArticles.map((a) => [a.slug, a]));
  const recipeBySlug = new Map(data.recipes.map((r) => [r.slug, r]));
  const cocktailBySlug = new Map(data.cocktails.map((c) => [c.slug, c]));
  const equipmentBySlug = new Map(data.equipment.map((e) => [e.slug, e]));
  const ingredientBySlug = new Map(data.ingredients.map((i) => [i.slug, i]));
  const supplierBySlug = new Map(data.suppliers.map((s) => [s.slug, s]));
  const collectionBySlug = new Map(data.collections.map((c) => [c.slug, c]));

  const reviewsByDateDesc = [...publishedReviews].sort((a, b) =>
    a.visitedOn < b.visitedOn ? 1 : -1,
  );
  const articlesByDateDesc = [...publishedArticles].sort((a, b) =>
    a.publishedDate < b.publishedDate ? 1 : -1,
  );

  const cityCounts = new Map<string, number>();
  for (const r of data.restaurants) {
    cityCounts.set(r.city, (cityCounts.get(r.city) ?? 0) + 1);
  }
  const topCities: CityStat[] = [...cityCounts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));

  const ownedEquipmentCount = data.equipment.filter((e) => e.status === "owned").length;
  const wishlistEquipmentCount = data.equipment.filter((e) => e.status === "wishlist").length;
  const alcoholFreeCocktailCount = data.cocktails.filter((c) => c.type === "alkoholfrei").length;

  const reviewedCount = data.restaurants.filter((r) => r.status === "reviewed").length;
  const watchlistCount = data.restaurants.filter(
    (r) => r.status === "wishlist" || r.status === "planned",
  ).length;

  const stats: StatStub[] = [
    {
      label: "Restaurants insgesamt",
      value: data.restaurants.length,
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
      value: topCities.length,
      icon: "/assets/stats/stat-icon-top-cities.svg",
    },
  ];

  const searchIndex = buildSearchIndex(data, restaurantBySlug);

  return {
    ...data,
    restaurantBySlug,
    reviewBySlug,
    articleBySlug,
    recipeBySlug,
    cocktailBySlug,
    equipmentBySlug,
    ingredientBySlug,
    supplierBySlug,
    collectionBySlug,
    reviewsByDateDesc,
    articlesByDateDesc,
    topCities,
    ownedEquipmentCount,
    wishlistEquipmentCount,
    alcoholFreeCocktailCount,
    stats,
    searchIndex,
  };
}
