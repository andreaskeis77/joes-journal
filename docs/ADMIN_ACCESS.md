# ADMIN_ACCESS – Directus hinter Cloudflare Access (E1.1)

**Stand:** 2026-05-29 · [ROADMAP_EXPANSION.md](ROADMAP_EXPANSION.md) §E1.1

Ziel: `https://admin.zumfettigenjoe.com` erreicht das Directus-Admin – privat
hinter Cloudflare Access (nur Owner-E-Mail), Directus läuft im Dauerbetrieb,
Port 8055 bleibt loopback. Damit ist Redaktion von überall möglich, ohne den VPS
per RDP anzufassen.

> Dieser Teil ist **Hand-Arbeit im Cloudflare-Dashboard + auf dem VPS** und
> lässt sich nicht aus dem Repo automatisieren. Das Skript
> [`deploy/ensure-directus-service.ps1`](../deploy/ensure-directus-service.ps1)
> übernimmt nur den Dauerbetrieb-Teil. Die Schritte folgen exakt dem Muster der
> Frontend-Inbetriebnahme ([DEPLOY_STATE.md](DEPLOY_STATE.md) §4/§10).

## 1. Directus auf Dauerbetrieb (VPS, Administrator-PowerShell)

```powershell
cd C:\joes-journal\repo
.\deploy\ensure-directus-service.ps1
Start-ScheduledTask -TaskName JoesJournal-Directus
Invoke-RestMethod http://127.0.0.1:8055/server/health   # -> status ok
```

Stellt den Task auf „Start beim Boot, Neustart bei Absturz, kein Zeitlimit".

## 2. Directus-.env (VPS)

In `C:\joes-journal\repo\directus\.env`:

```ini
PUBLIC_URL=https://admin.zumfettigenjoe.com

# WICHTIG (häufigste „Login klappt nicht"-Ursache): Cloudflare terminiert TLS am
# Rand und spricht Directus per HTTP an. Directus setzt Login-Cookies dann
# standardmäßig OHNE „Secure" -> der Browser verwirft sie auf der HTTPS-Domain
# -> Endlos-Login/„ausgeloggt". Beide Secure-Flags erzwingen die Secure-Cookies;
# SameSite=lax überlebt den Cloudflare-Access-OTP-Redirect.
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAME_SITE=lax
REFRESH_TOKEN_COOKIE_SECURE=true
REFRESH_TOKEN_COOKIE_SAME_SITE=lax

# CORS nur falls nötig (das Frontend ruft Directus NICHT zur Laufzeit -> i.d.R. aus):
# CORS_ENABLED=true
# CORS_ORIGIN=https://zumfettigenjoe.com
```

Danach Directus neu starten:
`Restart-ScheduledTask -TaskName JoesJournal-Directus` (oder Stop/Start).

> `PUBLIC_URL` muss auf die Access-Domain zeigen, sonst brechen Login-Redirects
> und Asset-URLs im Admin. Die vier `*_COOKIE_*`-Zeilen sind der eigentliche Fix
> gegen den Login-Loop hinter dem HTTPS-Edge (adversarisch gegen Directus 11
> verifiziert).

## 3. Cloudflare Access-App (Dashboard)

Zero Trust → Access → Applications → **Add an application** → **Self-hosted**:

- **Application name:** `admin.zumfettigenjoe.com`
- **Session Duration:** z. B. 24h
- **Application domain:** `admin.zumfettigenjoe.com` (Zone `zumfettigenjoe.com`)
- **Policy:** Action **Allow**, Include → **Emails** → `andreas.keis@gmail.com`
  (One-Time-PIN). Exakt wie die Frontend-App `zumfettigenjoe.com`.

## 4. Tunnel Public Hostname (Dashboard)

Zero Trust → Networks → Tunnels → **Contabo-Wardrobe** → Public Hostname →
**Add a public hostname**:

- **Subdomain:** `admin` · **Domain:** `zumfettigenjoe.com`
- **Service:** `HTTP` → **`127.0.0.1:8055`**

> ⚠️ **`127.0.0.1`, nicht `localhost`** – `localhost` löst zu IPv6 `::1` auf,
> wo Directus nicht gebunden ist → `400 Bad Request`. (Gleiche Falle wie beim
> Frontend, DEPLOY_STATE §10.)

> ⚠️ Falls beim Anlegen „A/AAAA/CNAME record already exists" kommt: ein
> verwaister `admin`-DNS-Record existiert noch → in DNS löschen, dann Public
> Hostname neu anlegen (DEPLOY_STATE §10).

## 5. Verifikation

1. `https://admin.zumfettigenjoe.com` → Cloudflare-Access-Login (One-Time-PIN
   an die Owner-Mail) → danach Directus-Login → Admin nutzbar.
2. Port bleibt privat: von außen nur über Access; `8055` weiterhin nur loopback
   (kein Tunnel-Bypass, keine Firewall-Freigabe nötig).
3. Neustart-Test: `Restart-Computer` (geplant) → nach Boot ist Directus ohne
   Login erreichbar (`/server/health` ok), der Task startet automatisch.

## 6. Zusammenspiel mit E1.2 / E1.3

- Mit dem Auto-Rebuild-Listener (E1.2) wird „Save → Live" Realität: in
  `admin.zumfettigenjoe.com` veröffentlichen → Flow-Webhook → Rebuild.
- Foto-Uploads (E1.3) landen über den Bake im statischen `dist/` – Directus
  selbst (und damit `/assets/<id>`) bleibt hinter Access privat.
