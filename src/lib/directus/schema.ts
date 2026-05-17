/**
 * Wire shape of joes-journal Directus collections.
 *
 * These types reflect the snake_case field names as the Directus REST API
 * returns them. The mappers in `mappers.ts` translate them into the
 * camelCase domain types used by the Astro components.
 */

export interface DirectusRestaurant {
  id: string;
  slug: string;
  name: string;
  status: string;
  priority: string;
  city: string | null;
  region: string | null;
  cuisine: string | null;
  price_level: number | null;
  tags: string[] | null;
  note: string | null;
  image: string | null;
  website: string | null;
  reservation_url: string | null;
  maps_url: string | null;
}

export interface DirectusReview {
  id: string;
  slug: string;
  title: string;
  status: string;
  restaurant: string | { slug: string };
  visited_on: string | null;
  rating: number | string;
  excerpt: string | null;
  body: string[] | null;
  image: string | null;
  gallery_images: string[] | null;
}

export interface DirectusIngredient {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  image: string | null;
  note: string | null;
  supplier_slugs: string[] | null;
}

export interface DirectusSupplier {
  id: string;
  slug: string;
  name: string;
  type: string | null;
  city: string | null;
  website: string | null;
  note: string | null;
}

export interface DirectusEquipment {
  id: string;
  slug: string;
  name: string;
  status: string;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  product_url: string | null;
  image: string | null;
  note: string | null;
  linked_recipe_slugs: string[] | null;
  linked_cocktail_slugs: string[] | null;
}

export interface DirectusRecipeIngredient {
  amount: string;
  item: string;
  ingredient_slug: string | null;
}

export interface DirectusRecipe {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  summary: string | null;
  servings: number | null;
  prep_min: number | null;
  cook_min: number | null;
  difficulty: string;
  tags: string[] | null;
  ingredients: DirectusRecipeIngredient[] | null;
  steps: string[] | null;
  equipment_slugs: string[] | null;
  notes: string | null;
}

export interface DirectusCocktailPour {
  amount: string;
  item: string;
  ingredient_slug: string | null;
}

export interface DirectusCocktail {
  id: string;
  slug: string;
  name: string;
  type: string;
  glass: string | null;
  ice: string | null;
  technique: string | null;
  flavor_profile: string | null;
  image: string | null;
  pours: DirectusCocktailPour[] | null;
  garnish: string | null;
  preparation: string[] | null;
  variants: string[] | null;
}

export interface DirectusContentCollection {
  id: string;
  slug: string;
  title: string;
  type: string;
  image: string | null;
  description: string | null;
  restaurant_slugs: string[] | null;
  recipe_slugs: string[] | null;
  cocktail_slugs: string[] | null;
  equipment_slugs: string[] | null;
}

export interface DirectusLink {
  id: string;
  url: string;
  label: string;
  source: string | null;
  restaurant_slug: string | null;
  recipe_slug: string | null;
  cocktail_slug: string | null;
  equipment_slug: string | null;
}
