---
title: "Umgebungsvariablen: Das Sicherheitsloch in jedem Startup"
excerpt: "Ihre .env-Datei enthält Ihr Datenbank-Passwort, den Stripe-Secret-Key und AWS-Zugangsdaten. Sie liegt in einer Slack-Nachricht, auf dem Laptop eines Entwicklers und wahrscheinlich irgendwo in einem Docker-Image. Lassen Sie uns das beheben."
sourceSlug: environment-variables-the-security-hole-in-every-startup
locale: de
sourceHash: b4aa2f8e3a21f653
machineTranslated: true
---

# Umgebungsvariablen: Das Sicherheitsloch in jedem Startup

Schnelle Prüfung: Wo befindet sich gerade dein Datenbank-Passwort?

Wenn du mit ".env-Datei im Repository-Root" geantwortet hast – du bist in der Mehrheit. Wenn du mit "auch in einer Slack-Nachricht an den neuen Mitarbeiter, einem Screenshot in Confluence und fest codiert in dieser einen Lambda-Funktion, die Dave geschrieben hat, bevor er ging" geantwortet hast – dann bist du ehrlich.

Umgebungsvariablen sind die gefährlichste Infrastruktur in den meisten Startups, weil jeder sie als nebensächlich betrachtet.

## Die häufigen Fehler

### Fehler 1: .env in der Versionskontrolle

Ich habe es in Produktions-Repos bei echten Unternehmen gesehen. Ein \
