# CONTENT_REBUILD – joes-journal

**Stand:** 2026-05-29

## 1. Das Problem

Das Frontend ist eine **statische Astro-Site** (`output: "static"` in
[`astro.config.mjs`](../astro.config.mjs)). Inhalte werden **zur Build-Zeit** aus
Directus gezogen (`JOES_DATA_SOURCE=directus`, siehe
[`src/data/source.ts`](../src/data/source.ts)).

Konsequenz: Eine Änderung in Directus (neue Kritik, korrigierter Text, Status
`draft → published`) erscheint **nicht automatisch** auf der Website. Erst ein
neuer `astro build` regeneriert `dist/`. Der „Deploymentfluss" in
[`ARCHITECTURE.md §8`](ARCHITECTURE.md) ist **code-getrieben** (git push), nicht
**content-getrieben**. Diese Lücke wird hier bewusst geschlossen.

## 2. Entscheidung

| Phase             | Mechanismus                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **MVP (P9–P11)**  | **Expliziter Rebuild** via [`deploy/rebuild.ps1`](../deploy/rebuild.ps1) — manuell nach Redaktion **und** als geplanter nächtlicher Task |
| **Phase 2 (P12)** | **Directus Flow → Webhook → Rebuild** (Near-Realtime, siehe §5)                                                                          |

**Begründung MVP-Wahl:** Der einzige Redakteur ist Andreas. Ein „Publish =
sichtbar in ≤ X Minuten oder über Nacht" ist für ein privates Journal
ausreichend, robust und ohne zusätzliche offene Ports/Services. Ein
Webhook-Listener ist zusätzliche Angriffsfläche und Betriebskomplexität, die im
MVP (private-first, native Windows, kein Docker) nicht gerechtfertigt ist.

> **Wichtig:** Solange dieser Mechanismus nicht läuft, gilt:
> **„In Directus gespeichert ≠ auf der Website sichtbar."** Das ist die häufigste
> Verwirrung und steht deshalb hier zuerst.

## 3. Rebuild-Skript

[`deploy/rebuild.ps1`](../deploy/rebuild.ps1) macht genau einen Content-Rebuild:

1. Prüft, dass Directus erreichbar ist (`/server/health`) — bricht sonst ab,
   bevor der Build startet.
2. **Atomarer Build:** legt das bestehende `dist/` vor dem Build beiseite
   (`dist.prev`) und stellt es bei einem Build-Fehler wieder her — nie eine
   halb-leere Site, auch wenn Directus _während_ des Fetch ausfällt (`astro build`
   leert `dist/` zu Beginn).
3. Baut mit `JOES_DATA_SOURCE=directus` (vom Skript gesetzt; die `.env` im
   Repo-Root liefert nur `JOES_DIRECTUS_URL/EMAIL/PASSWORD`, **keine** Secrets
   im Skript).
4. Schreibt ein Log nach `C:\joes-journal\logs\deploy\`.
5. Optional: startet den Static-Serving-Dienst neu (`-RestartService <name>`),
   falls die Auslieferung nicht direkt aus `dist/` über IIS/Cloudflared läuft.

Manuell nach einer Redaktion:

```powershell
C:\joes-journal\repo\deploy\rebuild.ps1
```

Mit Code-Update (zieht vorher `git pull --ff-only` + `pnpm install`):

```powershell
C:\joes-journal\repo\deploy\rebuild.ps1 -WithCodeUpdate
```

## 4. Geplanter nächtlicher Rebuild (MVP-Backstop)

Damit auch ohne manuellen Trigger spätestens über Nacht alles aktuell ist:

```powershell
$action    = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File C:\joes-journal\repo\deploy\rebuild.ps1"
$trigger   = New-ScheduledTaskTrigger -Daily -At 4am
# SYSTEM-Principal -> laeuft unbeaufsichtigt, auch wenn niemand angemeldet ist.
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "JoesJournal-Rebuild" -Action $action -Trigger $trigger `
  -Principal $principal `
  -Description "Naechtlicher Content-Rebuild des Astro-Frontends aus Directus"
```

> Prüft vorher in der VPS-Discovery, dass kein gleichnamiger Task existiert.
> Das SYSTEM-Konto braucht `node`/`corepack`/`git` im **Maschinen-PATH** (nach
> dem VPS-Setup gegeben — das Skript ruft `corepack pnpm`, nicht ein globales
> `pnpm`-Shim). Alternativ einen dedizierten Service-User mit gespeicherten
> Credentials und „run whether logged on or not" nutzen.

## 5. Auto-Rebuild: Poll-basiert (robust, EMPFOHLEN, 2026-06)

Der ursprüngliche Webhook-Weg (§6) hängt an **drei fragilen Teilen** – einem
Directus-**Flow** (verschwindet, wenn nicht mit ✓ gespeichert), einem **Webhook**
und einem **Shared-Secret-Token** (`JOES_REBUILD_TOKEN`, neigt zum „Verkleben" in
der `.env`). Das war in der Praxis unzuverlässig.

**Ersatz ([`deploy/auto-rebuild.mjs`](../deploy/auto-rebuild.mjs)):** ein
VPS-seitiger **Poll-Task**, der alle paar Minuten Directus nach der jüngsten
Inhaltsänderung (`directus_activity`) fragt und `rebuild.ps1` **nur bei einer
echten Änderung** startet. Eigenschaften:

- **Nichts, das „verschwinden" kann:** kein Flow, kein Webhook, kein offener
  Port, **kein Token**. Nutzt dieselben `JOES_DIRECTUS_*`-Zugangsdaten wie der
  Build (nachweislich korrekt, weil der Build damit Inhalte zieht).
- **Selbstheilend:** Zeitstempel wird nur bei Build-Erfolg fortgeschrieben; bei
  Fehler versucht es der nächste Lauf erneut. Zustand in
  `C:\joes-journal\state\auto-rebuild.json` (außerhalb des Repos → `git pull`
  fasst ihn nie an).
- **Keine Überlappung:** der Task läuft mit `MultipleInstances IgnoreNew`.
- **Atomar:** `rebuild.ps1` behält bei Fehler das alte `dist/` (siehe §3).

Installieren (Administrator-PowerShell auf dem VPS):

```powershell
# JOES_DIRECTUS_URL/EMAIL/PASSWORD stehen bereits in C:\joes-journal\repo\.env
C:\joes-journal\repo\deploy\install-auto-rebuild.ps1 -User srv-ops-admin
Start-ScheduledTask -TaskName JoesJournal-Auto-Rebuild
node C:\joes-journal\repo\deploy\auto-rebuild.mjs   # einmal manuell testen
```

Test: in Directus etwas auf `published` setzen → in ≤ ~Intervall+Build (Default
3 Min + ~30 s) live, ohne manuellen Eingriff. Der nächtliche Backstop (§4)
bleibt als zweites Sicherheitsnetz.

> Wechsel vom Webhook auf Poll: den **Directus-Flow löschen** (sonst doppelte
> Trigger) und den alten Listener-Task deaktivieren
> (`Disable-ScheduledTask -TaskName JoesJournal-Rebuild-Listener`).

## 6. Auto-Rebuild: Webhook-getrieben (VERALTET, ersetzt durch §5)

> ⚠️ **Veraltet.** Funktional, aber fragil (Flow/Webhook/Token). Durch den
> Poll-Task in §5 ersetzt. Nur noch als Referenz dokumentiert.

Near-Realtime „Save → Live" ohne manuellen Eingriff. Zwei Bausteine:

### 5a. Rebuild-Listener (`deploy/rebuild-listener.mjs`)

Ein winziger Node-HTTP-Dienst, der `rebuild.ps1` **debounced** startet:

- **Loopback-only:** bindet ausschließlich `127.0.0.1:8787` — nie aus dem Netz
  erreichbar; der Directus-Flow läuft auf derselben Maschine und ruft
  `127.0.0.1`.
- **Shared-Secret:** akzeptiert nur `POST /rebuild` mit Header
  `X-Joe-Rebuild-Token == JOES_REBUILD_TOKEN` (Konstantzeit-Vergleich), sonst
  `401`. Das Token steht in der gitignored `.env`, nie im Repo.
- **Debounce:** sammelt Speichervorgänge in einem Fenster
  (`JOES_REBUILD_DEBOUNCE_MS`, Default 60 s) → genau **ein** Build. Während ein
  Build läuft, wird höchstens **ein** Folge-Build eingereiht (kein Stau, keine
  Überlappung).
- **Health:** `GET /health` → JSON (`running`, `scheduled`).

Als Dauerdienst installieren (Administrator-PowerShell auf dem VPS):

```powershell
# 1) Token in C:\joes-journal\repo\.env eintragen (langer Zufallswert):
#    JOES_REBUILD_TOKEN=<32+ zufaellige Zeichen>
# 2) Task registrieren (Start beim Boot, Neustart bei Absturz):
C:\joes-journal\repo\deploy\install-rebuild-listener.ps1 -User srv-ops-admin
Start-ScheduledTask -TaskName JoesJournal-Rebuild-Listener
Invoke-RestMethod http://127.0.0.1:8787/health   # -> status ok
```

### 5b. Directus Flow

1. **Settings → Flows → Create Flow.** Trigger: **Event Hook**, Typ
   **Action (non-blocking)**, Scope `items.create` / `items.update` /
   `items.delete` auf den Content-Collections (`restaurants`,
   `restaurant_reviews`, `articles`, `recipes`, `cocktails`, `equipment`,
   `content_collections`, `links`).
2. Operation **Webhook / Request URL**: Method `POST`, URL
   `http://127.0.0.1:8787/rebuild`, Header `X-Joe-Rebuild-Token: <Token aus .env>`.
3. Speichern. Test: eine Kritik auf `published` setzen → in ≤ ~1–2 Min
   (Debounce + Build) live, ohne manuellen Eingriff.

> Der Listener startet `rebuild.ps1`, das wiederum den Bild-Bake (E1.3) und den
> atomaren Build ausführt. Schlägt ein Build fehl, bleibt das alte `dist/`
> stehen (siehe §3) — eine Redaktion kann die Live-Site nie „leer" machen.

### 5c. Nächtlicher Backstop

Der Task aus §4 (`JoesJournal-Rebuild`, SYSTEM, 4 Uhr) bleibt als Sicherheitsnetz
bestehen, falls der Listener mal nicht lief oder ein Hook verloren ging.

## 6. Verwandte Dokumente

- [`ARCHITECTURE.md`](ARCHITECTURE.md) – §8 Datenfluss; §10 offener Punkt „statisch vs. SSR"
- [`VPS_DEPLOYMENT_PLAN.md`](VPS_DEPLOYMENT_PLAN.md) – Deploymentfluss, Dienste
- [`ROADMAP.md`](ROADMAP.md) – P9/P12
