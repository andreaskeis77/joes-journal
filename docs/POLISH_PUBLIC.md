# POLISH_PUBLIC – Öffentlich & Feinschliff (Phase E4)

**Stand:** 2026-05-29 · [ROADMAP_EXPANSION.md](ROADMAP_EXPANSION.md) §E4

## E4.1 – Selektiv öffentliche Seiten

Private-first bleibt der Default. Umgesetzt:

- **`public/robots.txt`**: `Disallow: /` (alles sperren) – Defense-in-depth
  hinter Cloudflare Access.
- **`<meta name="robots" content="noindex, nofollow">`** auf **jeder** Seite,
  gesteuert über die BaseLayout-Prop `index` (Default `false`).

**Eine Seite öffentlich machen** (Checkliste, [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md) §11):

1. Cloudflare Access: **Bypass-Policy** für den Pfad (Zero Trust → Access → die
   App → Policy „Bypass" mit Include „Everyone" nur für diesen Pfad).
2. In der Seite `index={true}` an `BaseLayout` übergeben (entfernt `noindex`).
3. `robots.txt`: gezielte `Allow:`-Regel für den Pfad ergänzen.
4. SEC-1 bleibt aktiv: nur `published` ist überhaupt im `dist/`.

> Reihenfolge wichtig: erst Access-Bypass + bewusste Freigabe, dann Indexierung.
> Nie `index={true}` setzen, solange der Pfad noch komplett hinter Access liegt.

## E4.2 – Externe Backup-Kopie + Restore-Drill (schließt P11)

`deploy/backup-external.ps1`: pg_dump → externe Kopie (UNC/Netzlaufwerk oder
rclone-Remote) → lokale Aufbewahrung begrenzen.

```powershell
# Netzlaufwerk/UNC:
$env:PGPASSWORD = "<pw>"; .\deploy\backup-external.ps1 -ExternalDest "\\nas\backups\joes"
# Cloud (rclone-Remote vorausgesetzt konfiguriert):
.\deploy\backup-external.ps1 -ExternalDest "b2:joes-journal/backups" -UseRclone
```

- Keine Secrets im Skript (Passwort aus `$env:PGPASSWORD`/`.pgpass`, am Ende
  bereinigt; rclone aus seiner eigenen Config).
- Sanity-Check: bricht ab, wenn der Dump verdächtig klein ist.
- **Als Scheduled Task** (täglich, SYSTEM/Service-Konto) einrichten – analog zum
  nächtlichen Rebuild ([CONTENT_REBUILD.md](CONTENT_REBUILD.md) §4).
- **Restore-Drill** (das eigentliche „P11 erledigt"): regelmäßig ein Dump in eine
  Test-DB einspielen und prüfen – Vorgehen in [POSTGRES_DRYRUN.md](POSTGRES_DRYRUN.md)
  und [MIGRATION_E2.md §3](MIGRATION_E2.md). Erst der erfolgreiche Drill macht das
  Backup verlässlich.

## E4.3 – Logo / Wortmarke

**Bewertung:** Es existieren bereits fertige Marken-Assets in
`public/assets/brand/` – u. a. `brand-wordmark-zum-fettigen-joe-primary.svg` und
`brand-wordmark-lockup-primary.svg`. Der Header nutzt aktuell nur das runde Badge
(`brand-badge-joe-round.svg`) + getexteten Schriftzug.

**Empfehlung (Design-Entscheidung des Owners):** im `SiteHeader` das Badge durch
die fertige Wortmarke-Lockup ersetzen oder beides kombinieren. Bewusst **nicht**
eigenmächtig geändert – das ist eine gestalterische Entscheidung. Kein
Code-Blocker; rein optisch.

## E4.4 – Docker-Neubewertung

**Bewertung:** Aktuell läuft alles nativ unter Windows (Node, PostgreSQL, IIS,
cloudflared, zwei Scheduled Tasks: Directus + Rebuild-Listener). Das ist für
**einen** Redakteur stabil und wartbar.

**Empfehlung: vorerst bei nativ bleiben.** Docker neu bewerten, sobald einer der
Trigger eintritt:

- mehr als ~3 dauerhafte Dienste oder mehrere Umgebungen (stage/prod),
- reproduzierbare Deployments über mehrere Hosts nötig,
- Directus-Upgrades werden riskant/aufwändig (Container = sauberes Pinning),
- ein zweiter Redakteur / echte Lastanforderungen.

Bis dahin überwiegt der Betriebsvorteil der nativen, schlanken Lösung
([ARCHITECTURE.md §3](ARCHITECTURE.md)). Kein Handlungsbedarf jetzt.
