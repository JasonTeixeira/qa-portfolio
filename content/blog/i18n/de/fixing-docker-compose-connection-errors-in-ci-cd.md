---
title: "Beheben von Docker Compose-Verbindungsfehlern in CI/CD"
excerpt: "Habe 4 Stunden damit verbracht, 'Connection refused'-Fehler in Jenkins zu debuggen. Hier ist, was ich über Docker-Netzwerke in CI-Pipelines gelernt habe."
sourceSlug: fixing-docker-compose-connection-errors-in-ci-cd
locale: de
machineTranslated: true
---

# Behebung von Docker-Compose-Verbindungsfehlern in CI/CD

Stellen Sie sich vor: Ihr Docker-Compose-Setup funktioniert einwandfrei auf Ihrem lokalen Rechner. Sie pushen in CI, und plötzlich schlagen alle Integrationstests mit `Connection refused` fehl.

Der Datenbankcontainer läuft. Der API-Container ist "healthy". Der Testprozess startet. Dann kann er keine Verbindung zum benötigten Dienst herstellen.

Dieser Fehler wirkt zufällig, bis Sie sich an eines erinnern: Lokales Docker-Netzwerk und CI-Docker-Netzwerk sind nicht dieselbe Umgebung.

:::proof-note title="Die eigentliche Lektion" label="ci note"
Die meisten Docker-Compose-Verbindungsfehler in CI sind keine Docker-Probleme. Es sind Timing-, Hostname-, Port- oder Netzwerkgrenzen-Probleme, die die lokale Entwicklung verbirgt.
:::

## Das lokale Setup täuscht Sie

Auf Ihrem Rechner verbinden Sie sich vielleicht mit Postgres unter `localhost:5432`.

Innerhalb eines Compose-Netzwerks sollte sich ein anderer Container normalerweise mit `postgres:5432` verbinden, wobei `postgres` der Dienstname ist.

In CI kann der Test-Runner sein:

- innerhalb des Compose-Netzwerks
- außerhalb des Compose-Netzwerks auf dem Host
- innerhalb eines CI-Service-Containers
- innerhalb eines verschachtelten Docker-Executors

Diese vier Fälle verwenden unterschiedliche Hostnamen.

Deshalb kann ein Verbindungsstring lokal "korrekt" und in der Pipeline falsch sein.

## Zuerst identifizieren, wo der Testprozess läuft

Bevor Sie Ports ändern, stellen Sie eine Frage:

> Läuft der Testbefehl innerhalb eines Compose-Dienstes oder auf dem CI-Host?

Wenn Tests innerhalb von Compose laufen:

```txt
DATABASE_URL=postgres://user:pass@postgres:5432/app
```

Wenn Tests auf dem CI-Host laufen und Compose den Port veröffentlicht hat:

```txt
DATABASE_URL=postgres://user:pass@127.0.0.1:5432/app
```

Wenn Tests in einem separaten CI-Container laufen, funktioniert möglicherweise keines, bis die Service-Netzwerkkonfiguration der CI-Plattform eingerichtet ist.

:::system-diagram title="CI-Netzwerkentscheidung" label="compose -> tests" nodes="Compose-Dienst,Netzwerk,Test-Runner,Datenbank"
Der richtige Hostname hängt davon ab, wo der Test-Runner lebt. Dienstnamen funktionieren innerhalb des Compose-Netzwerks. Veröffentlichte localhost-Ports funktionieren vom Host aus.
:::

## Vertrauen Sie nicht auf `depends_on` als Bereitschaftsindikator

`depends_on` kann die Startreihenfolge steuern. Es garantiert nicht, dass Postgres, Redis oder Ihre App bereit sind, Verbindungen anzunehmen.

Die häufige schlechte Version:

```yaml
services:
  api:
    depends_on:
      - postgres
```

Das bedeutet nur, dass der `postgres`-Container vor `api` startet. Es bedeutet nicht, dass Migrationen ausgeführt wurden. Es bedeutet nicht, dass TCP bereit ist. Es bedeutet nicht, dass die Datenbank die Authentifizierung akzeptiert hat.

Verwenden Sie Health Checks oder ein explizites Warteskript.

```yaml
services:
  postgres:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 12

  api:
    depends_on:
      postgres:
        condition: service_healthy
```

Das löst nicht jedes CI-Problem, aber es beseitigt den häufigsten Race-Condition.

## Überprüfen Sie die vier Fehlerklassen

Wenn ich `Connection refused` sehe, arbeite ich diese Reihenfolge ab.

:::checklist title="Docker-Compose-CI-Checkliste" label="debug order"
- Bestätigen Sie den Test-Runner-Standort: Host, Compose-Dienst oder CI-Service-Container
- Bestätigen Sie den Hostnamen: Dienstname vs. 127.0.0.1 vs. Plattform-Service-Alias
- Bestätigen Sie, dass der veröffentlichte Port tatsächlich gemappt ist
- Bestätigen Sie, dass die Abhängigkeit vor Teststart healthy ist
- Geben Sie die aufgelösten Umgebungsvariablen in CI aus, ohne Geheimnisse preiszugeben
- Führen Sie vor der vollständigen Testsuite einen kleinen TCP-Check durch
:::

Der TCP-Check ist langweilig, aber nützlich:

```bash
node -e "require('net').connect(5432, process.env.DB_HOST).on('connect', () => { console.log('ok'); process.exit(0) }).on('error', e => { console.error(e.message); process.exit(1) })"
```

Wenn das fehlschlägt, ist Ihre Anwendungs-Testsuite noch nicht das, was Sie debuggen sollten.

## Verwenden Sie unterschiedliche Verbindungsstrings für verschiedene Grenzen

Ein sauberes Muster ist, die Grenze explizit zu machen:

```env
DATABASE_URL_INTERNAL=postgres://app:app@postgres:5432/app
DATABASE_URL_HOST=postgres://app:app@127.0.0.1:5432/app
```

Dann wählt Ihr CI-Job den richtigen basierend darauf, wo der Befehl läuft.

Das ist weniger magisch, als zu versuchen, eine URL überall funktionieren zu lassen.

:::scorecard title="Verbindungsstring-Sanity-Check" label="scorecard"
Runner-Standort | Hostname | Port-Quelle
Innerhalb von Compose | postgres | Container-Port
CI-Host | 127.0.0.1 | Veröffentlichter Port
CI-Service-Container | Service-Alias | Plattform-Service-Konfiguration
Remote-DB | Öffentlicher/privater DB-Host | Netzwerk-Allowlist
:::

## Halten Sie Migrationen von der Bereitschaft getrennt

Eine Datenbank kann healthy sein, bevor das Schema bereit ist.

Wenn Ihre App Migrationen benötigt, machen Sie dies zu einem expliziten Pipeline-Schritt:

```bash
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm test
```

Oder führen Sie Tests innerhalb eines Dienstes aus, der auf beides wartet:

- Datenbank-Health
- abgeschlossene Migrationen
- geladene Seed-Daten

Sonst erhalten Sie eine schlimmere Fehlerklasse: intermittierende Testfehler, die wie App-Bugs aussehen, aber eigentlich Setup-Race-Conditions sind.

## Die Debug-Ausgabe, die ich bei jedem CI-Fehler haben möchte

Geben Sie keine Geheimnisse preis. Geben Sie die Form der Umgebung aus.

Nützliche Ausgabe:

- Docker-Compose-Dienste und -Status
- Container-Logs für die Abhängigkeit
- aufgelöster Host und Port, mit geschwärztem Passwort
- Netzwerknamen
- Health-Check-Status
- Migrationsstatus

Beispiel:

```bash
docker compose ps
docker compose logs --tail=80 postgres
docker network ls
```

Das Ziel ist, den nächsten Fehler in einem Durchlauf diagnostizierbar zu machen.

## Die Produktionslektion

CI-Netzwerkschmerz ist eine Vorschau auf Produktions-Integrationsschmerz.

Wenn Ihre Tests von Hoffnung abhängen, tun es Ihre Deployments wahrscheinlich auch. Machen Sie Dienstgrenzen explizit. Fügen Sie Health Checks hinzu. Trennen Sie Bereitschaft von Migrationen. Protokollieren Sie die richtigen Fakten.

So verwandeln Sie "funktioniert auf meinem Rechner" in etwas, das eine Pipeline beweisen kann.

:::offer-cta title="Muss die Pipeline bereinigt werden?" label="nächster Schritt" href="/tools/route-finder" cta="Finden Sie Ihren Weg"
Nutzen Sie die Diagnose, um zu entscheiden, ob dies ein fokussierter Audit-Sprint, ein Plattform-Build oder ein Academy-Pfad ist, den Sie selbst durcharbeiten können.
:::
