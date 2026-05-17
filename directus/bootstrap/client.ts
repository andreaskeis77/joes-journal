import {
  createDirectus,
  authentication,
  rest,
  staticToken,
  type DirectusClient,
  type AuthenticationClient,
  type RestClient,
} from "@directus/sdk";

export interface Env {
  url: string;
  email: string;
  password: string;
}

export function readEnv(): Env {
  const url = process.env.PUBLIC_URL ?? "http://127.0.0.1:8055";
  const email = process.env.ADMIN_EMAIL ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in directus/.env (copy from .env.example).",
    );
  }
  return { url, email, password };
}

export type Client = DirectusClient<Record<string, unknown>> &
  AuthenticationClient<Record<string, unknown>> &
  RestClient<Record<string, unknown>>;

export async function authenticatedClient(env: Env = readEnv()): Promise<Client> {
  const client = createDirectus(env.url).with(authentication()).with(rest());
  await client.login(env.email, env.password);
  return client;
}

export function tokenClient(url: string, token: string) {
  return createDirectus(url).with(staticToken(token)).with(rest());
}
