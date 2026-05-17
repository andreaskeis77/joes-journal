import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".astro/**",
      "test-results/**",
      "playwright-report/**",
      ".venv/**",
      "tools/**",
      "directus/node_modules/**",
      "directus/data/**",
      "directus/uploads/**",
      "public/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.astro"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true }],
    },
  },
  {
    files: ["**/*.test.ts", "tests/**/*.ts", "playwright.config.ts", "vitest.config.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}", "directus/scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
  },
  {
    // Inline <script> blocks in .astro files target the browser, not Node.
    files: ["src/**/*.astro"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        location: "readonly",
        history: "readonly",
        navigator: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        URL: "readonly",
        console: "readonly",
      },
    },
  },
];
