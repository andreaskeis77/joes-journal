# SECURITY_PRIVACY – joes-journal

## 1. Sicherheitsziel

`joes-journal` ist im MVP privat und kontrolliert zugänglich.

Die Plattform ist nicht für eine unbekannte Öffentlichkeit gedacht. Spätere selektive Veröffentlichung ist möglich, aber nicht MVP-Ziel.

## 2. Grundentscheidungen

| Thema                    | Entscheidung                                 |
| ------------------------ | -------------------------------------------- |
| Sichtbarkeit             | erst privat, später selektiv öffentlich      |
| Zugriff Frontend         | Cloudflare Access                            |
| Zugriff Admin            | Cloudflare Access + Directus Login           |
| Serverzugriff            | Tailscale-RDP                                |
| Tracking                 | kein Tracking im MVP                         |
| Bilder                   | eigene oder klar lizenzierte Bilder          |
| Externe Bilder           | nicht ungeprüft übernehmen                   |
| Personenbezogene Inhalte | keine öffentlichen personenbezogenen Inhalte |
| API                      | keine öffentliche API im MVP                 |

## 3. Threat Model

| Risiko                                   | Gegenmaßnahme                                     |
| ---------------------------------------- | ------------------------------------------------- |
| Öffentlicher Zugriff auf private Inhalte | Cloudflare Access                                 |
| Directus Admin öffentlich erreichbar     | eigene Admin-Subdomain + Access + Login           |
| RDP-Angriff                              | kein öffentliches RDP, Tailscale only             |
| Secret Leak                              | `.env` gitignored, Secret Scan                    |
| Datenverlust                             | PostgreSQL- und Upload-Backups                    |
| Unklare Bildrechte                       | eigene/legitime Fotos                             |
| Externe Inhalte unzulässig kopiert       | Links statt Kopie, keine fremden Bilder ungeprüft |
| Agent schreibt Unsinn                    | Tranche, Review, Tests                            |
| Schemaänderung bricht Daten              | Backup vor Migration, Restore-Test                |

## 4. Secrets

Nicht ins Repo:

- Directus Secret
- DB Passwort
- Cloudflare Tunnel Token
- Tailscale Auth Keys
- Admin Passwort
- API Keys

Pflicht:

- `.env.example` mit Platzhaltern
- `.env` in `.gitignore`
- Secret Scan in Quality Gates

## 5. Cloudflare Access

MVP:

- `zumfettigenjoe.com` geschützt
- `admin.zumfettigenjoe.com` geschützt
- Access nur für definierte Benutzer/E-Mail-Konten

Später:

- einzelne öffentliche Seiten oder Pfade möglich
- Admin bleibt immer geschützt

## 6. Directus Security

Regeln:

- Admin-Benutzer mit starkem Passwort
- keine offenen Registrierungen
- Rollen minimal halten
- Read-only Rollen erst bei Bedarf
- Files/Uploads nicht unkontrolliert öffentlich machen
- Admin nur über Access
- Directus nicht direkt über öffentliche IP exponieren

## 7. Datenbank

PostgreSQL:

- nur lokal erreichbar
- eigenes DB-Userkonto
- starkes Passwort
- Backups
- kein externer Port

## 8. Bilder und Rechte

Erlaubt:

- eigene Restaurantfotos
- eigene Foodfotos
- eigene Gerätebilder
- selbst erzeugte Grafiken
- klar lizenzierte Bilder

Nicht ohne Prüfung:

- Restaurantfotos von Websites
- Herstellerbilder
- fremde Produktbilder
- Social-Media-Bilder
- Screenshots aus fremden Seiten

Regel:

> Externe Bilder werden im MVP nicht ungeprüft übernommen. Lieber Link speichern als Bild kopieren.

## 9. Externe Links

Links sind eigene Objekte.

Link-Felder:

- URL
- Titel
- Quelle
- Reliability
- Linktyp
- Status
- letzte Prüfung optional

Defekte oder problematische Links können archiviert werden.

## 10. Keine öffentlichen personenbezogenen Inhalte

Keine Veröffentlichung von:

- privaten Namen Dritter
- Kontaktdaten
- Rechnungen
- Reservierungsdetails
- privaten Fotos von Personen ohne Absicht/Freigabe
- internen Notizen, die nicht öffentlich sein sollen

## 11. Öffentliche Freigabe später

Vor jeder selektiven Veröffentlichung prüfen:

- Ist die Seite wirklich für Öffentlichkeit gedacht?
- Enthält sie fremde Bilder?
- Enthält sie private Notizen?
- Enthält sie personenbezogene Daten?
- Braucht es Impressum/Datenschutz?
- Soll SEO/robots aktiviert werden?
- Ist Cloudflare Access für diesen Pfad bewusst entfernt?

## 12. MVP-Checkliste

- [ ] `.env` nicht im Repo
- [ ] Directus Admin hinter Cloudflare Access
- [ ] Frontend hinter Cloudflare Access
- [ ] DB nur lokal
- [ ] RDP nur Tailscale
- [ ] keine fremden Bilder ungeprüft
- [ ] kein Tracking
- [ ] Backup eingerichtet
- [ ] Restore-Test geplant
