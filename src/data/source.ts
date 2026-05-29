/**
 * Data source for Astro pages.
 *
 * Selects between the bundled stub data (default; no Directus required)
 * and a live Directus instance based on JOES_DATA_SOURCE. The selection
 * happens once at module load via top-level await; the page frontmatter
 * sees a single, consistent bundle for the duration of the build.
 *
 * Pages should import from this module instead of `./stub` so that
 * switching the source is a one-line env change.
 */
import {
  restaurants as stubRestaurants,
  reviews as stubReviews,
  articles as stubArticles,
  recipes as stubRecipes,
  cocktails as stubCocktails,
  equipment as stubEquipment,
  ingredients as stubIngredients,
  suppliers as stubSuppliers,
  collections as stubCollections,
  links as stubLinks,
  categories as staticCategories,
  quickChips as staticQuickChips,
} from "./stub";
import { derive, statusOrder, type RawData } from "./derive";

const SOURCE = (import.meta.env.JOES_DATA_SOURCE ?? "stub") as "stub" | "directus";

function stubRaw(): RawData {
  return {
    restaurants: stubRestaurants,
    reviews: stubReviews,
    articles: stubArticles,
    recipes: stubRecipes,
    cocktails: stubCocktails,
    equipment: stubEquipment,
    ingredients: stubIngredients,
    suppliers: stubSuppliers,
    collections: stubCollections,
    links: stubLinks,
  };
}

const raw: RawData =
  SOURCE === "directus" ? await (await import("./loader-directus")).loadFromDirectus() : stubRaw();

if (SOURCE === "directus") {
  console.log(
    `[joes-journal] loaded ${raw.restaurants.length} restaurants, ` +
      `${raw.reviews.length} reviews, ${raw.recipes.length} recipes from Directus`,
  );
}

const bundle = derive(raw);

export const {
  restaurants,
  reviews,
  articles,
  recipes,
  cocktails,
  equipment,
  ingredients,
  suppliers,
  collections,
  links,
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
} = bundle;

export const categories = staticCategories;
export const quickChips = staticQuickChips;
export { statusOrder };

export type {
  RestaurantStub,
  RestaurantStatus,
  ReviewStub,
  ReviewStatus,
  ArticleStub,
  RecipeStub,
  RecipeDifficulty,
  RecipeIngredient,
  CocktailStub,
  CocktailType,
  CocktailPour,
  EquipmentStub,
  EquipmentStatus,
  IngredientStub,
  SupplierStub,
  CollectionStub,
  CollectionType,
  LinkStub,
  CategoryStub,
  StatStub,
  CityStat,
  SearchEntry,
  SearchKind,
} from "./stub";
