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

## 5. Phase 2 – Webhook-getriebener Rebuild (später, P12)

Sobald Near-Realtime gewünscht ist:

1. **Directus Flow** anlegen: Trigger `Event Hook`, Scope `items.create` /
   `items.update` / `items.delete` auf den Content-Collections.
2. Flow-Operation `Webhook / Request URL` → ruft einen kleinen lokalen
   Rebuild-Endpunkt auf (z. B. ein winziger Node/PowerShell-Listener auf
   `127.0.0.1`, der `rebuild.ps1` debounced startet).
3. **Debounce** (z. B. 60 s Sammelfenster), damit eine Bearbeitungs-Session mit
   10 Speichervorgängen nicht 10 Builds auslöst.
4. Der Endpunkt bleibt **loopback-only** (kein Cloudflare-Ingress) — der Flow
   ruft `localhost` auf, da Directus auf derselben Maschine läuft.

Bewusst **nicht** im MVP: zusätzlicher Dienst, Debounce-Logik, Fehlerpfade bei
Build-Fehlern während einer Redaktion.

## 6. Verwandte Dokumente

- [`ARCHITECTURE.md`](ARCHITECTURE.md) – §8 Datenfluss; §10 offener Punkt „statisch vs. SSR"
- [`VPS_DEPLOYMENT_PLAN.md`](VPS_DEPLOYMENT_PLAN.md) – Deploymentfluss, Dienste
- [`ROADMAP.md`](ROADMAP.md) – P9/P12
