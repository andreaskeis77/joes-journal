# ARCHITECTURE – joes-journal

## 1. Zielarchitektur

`joes-journal` wird als private, selbst gehostete Gastro-Plattform betrieben.

```text
Browser Desktop/Mobile
  → Cloudflare Access
    → zumfettigenjoe.com          → Astro Frontend
    → admin.zumfettigenjoe.com    → Directus Admin
        → PostgreSQL
```

Administrative Serverzugriffe erfolgen ausschließlich über Tailscale/RDP, nicht über öffentliches RDP.

## 2. Stack

| Schicht            | Entscheidung                            |
| ------------------ | --------------------------------------- |
| Frontend           | Astro + TypeScript                      |
| CMS/Admin          | Directus                                |
| Datenbank          | PostgreSQL                              |
| Package Manager    | pnpm                                    |
| VPS                | Windows VPS, native Installation im MVP |
| Externer Zugriff   | Cloudflare Access + Cloudflare Tunnel   |
| Adminzugang Server | Tailscale-RDP                           |
| Suche MVP          | Directus/PostgreSQL                     |
| Suche später       | Pagefind oder Meilisearch prüfen        |
| E2E/UX-Smokes      | Playwright später                       |

## 3. Betriebsmodell MVP

Für MVP wird **Native Windows** verwendet. Docker wird bewusst nicht im MVP eingeführt und später neu bewertet.

Begründung:

- bestehender VPS-Betrieb ist Windows-orientiert,
- Tailscale/Cloudflare/Windows-Firewall sind etabliert,
- Native Windows reduziert neue Betriebsrisiken,
- für ein privates MVP ist Betriebsverständlichkeit wichtiger als Container-Eleganz.

Docker wird neu bewertet, wenn mehrere Services wachsen, ein Umzug geplant ist oder CI/CD stärker containerisiert werden soll.

## 4. Domains

| Zweck          | Domain                             |
| -------------- | ---------------------------------- |
| Frontend       | `https://zumfettigenjoe.com`       |
| Directus Admin | `https://admin.zumfettigenjoe.com` |

Beide Domains sind im MVP privat/kontrolliert über Cloudflare Access geschützt. Directus Admin bleibt dauerhaft geschützt.

## 5. VPS-Laufzeitkomponenten

### PostgreSQL

- System of Record für Directus.
- Speichert Inhalte, Relationen, Benutzer, Rollen und Directus-Konfiguration.
- Nicht öffentlich erreichbar.
- Backup per geplantem Task.

### Directus

- Admin-/Redaktionsoberfläche.
- API-Schicht für Astro.
- Medienverwaltung.
- Rollen/Rechte.
- Schema Snapshots/Migrations werden versioniert.

### Astro

- Lese-Frontend.
- Holt Daten aus Directus.
- Rendert Startseite, Listen, Detailseiten, Suche, Filter und Statistik.

### Cloudflare

- Tunnel veröffentlicht Frontend und Admin-Domain.
- Access schützt beide Domains.
- Keine öffentlichen Inbound-Ports nötig.

### Tailscale

- Einziger administrativer Serverzugriff.
- RDP nur über Tailscale.
- Kein öffentliches RDP.

## 6. Ports

| Dienst     | Host         |                 Port | Öffentlich?              |
| ---------- | ------------ | -------------------: | ------------------------ |
| Directus   | `127.0.0.1`  |               `8055` | nein, nur via Cloudflare |
| Astro      | `127.0.0.1`  | `4321` oder statisch | nein, nur via Cloudflare |
| PostgreSQL | `127.0.0.1`  |               `5432` | nein                     |
| RDP        | Tailscale-IP |               `3389` | nur Tailscale            |

## 7. Pfade

DEV-LAPTOP:

```powershell
C:\projekte\joes-journal
```

VPS:

```powershell
C:\joes-journal
C:\joes-journal\data
C:\joes-journal\logs
C:\joes-journal\backups
```

## 8. Datenfluss

Lesefluss:

```text
PostgreSQL → Directus API → Astro Frontend → Browser
```

Redaktionsfluss:

```text
Browser Desktop → Cloudflare Access → Directus Admin → PostgreSQL / Directus Files
```

Deploymentfluss:

```text
DEV-LAPTOP → GitHub → VPS Pull/Deploy → Services Restart → Smoke Tests
```

## 9. Architekturregeln

1. Directus ist die redaktionelle Datenquelle.
2. PostgreSQL ist das System of Record.
3. Astro ist das Lese-Frontend, nicht der Redaktionsmodus.
4. Links sind eigene Objekte.
5. Restaurants und Kritiken sind getrennte Objekte.
6. Bewertungen sind einfache 5-Sterne-Bewertungen ohne Subscores.
7. Taxonomiebegriffe werden kontrolliert gepflegt.
8. Agenten dürfen Schemaänderungen nur mit Dokumentationsupdate ausführen.
9. Keine Secrets im Repo.
10. Keine öffentliche Freigabe ohne Security-/Privacy-Prüfung.

## 10. Offene Architekturpunkte

| Punkt                           | Status                                     |
| ------------------------------- | ------------------------------------------ |
| Astro statisch vs. SSR          | vor technischem Setup entscheiden          |
| Directus Schema Snapshot Format | beim Setup konkretisieren                  |
| Windows-Service-Mechanismus     | WinSW / NSSM / Scheduled Task prüfen       |
| Backup-Ziel                     | lokal zuerst, externe Kopie später         |
| Suche nach MVP                  | Pagefind vs. Meilisearch später evaluieren |
