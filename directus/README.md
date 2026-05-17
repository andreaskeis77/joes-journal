# @joes-journal/directus

Directus admin + API for **joes-journal**.

- Local development: SQLite (one file under `./data/`)
- Production (VPS): PostgreSQL (configured via `.env`)

Full setup runbook: see [docs/LOCAL_SETUP.md](../docs/LOCAL_SETUP.md).

## Quickstart

```powershell
# from this directory
copy .env.example .env

pnpm install

# first run: creates SQLite DB, runs migrations, creates admin user from .env
pnpm bootstrap

# apply our collection schema (restaurants, reviews, recipes, ...)
pnpm schema:apply

# load realistic seed data (8 restaurants, 3 reviews, 3 recipes, ...)
pnpm seed

# start the API + admin
pnpm start
# → http://127.0.0.1:8055  (admin login uses ADMIN_EMAIL / ADMIN_PASSWORD)
```

## Reset

```powershell
pnpm reset
```

Removes `./data/*.db` and `./uploads/`. Run `pnpm bootstrap` again to start clean.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm bootstrap` | Directus CLI bootstrap. Creates DB schema (Directus meta tables) and first admin user. |
| `pnpm schema:apply` | Applies our domain schema via Directus SDK (collections, fields, relations). |
| `pnpm schema:snapshot` | Exports current schema as YAML to `./schema/snapshot.yaml`. |
| `pnpm seed` | Inserts seed data via Directus SDK. |
| `pnpm start` | Starts Directus server. |
| `pnpm reset` | Drops local DB + uploads (irreversible). |
