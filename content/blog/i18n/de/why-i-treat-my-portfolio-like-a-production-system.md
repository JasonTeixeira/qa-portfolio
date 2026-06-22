---
title: "Warum ich mein Portfolio wie ein Produktionssystem betreibe"
excerpt: "SLOs, Incident Drills, WAF-Ratenbegrenzung und OIDC-Föderation – warum ich meine Portfolio-Seite mit derselben Strenge betreibe wie Unternehmensinfrastruktur und was das Personalverantwortlichen signalisiert."
sourceSlug: why-i-treat-my-portfolio-like-a-production-system
locale: de
sourceHash: 378dd32b468864fc
machineTranslated: true
---

# Warum ich mein Portfolio wie ein Produktionssystem behandle

Die meisten Entwickler-Portfolios sind statische Seiten. Meines hat SLOs.

Hier geht es nicht um Over-Engineering. Es geht darum, eine spezifische Fähigkeit zu demonstrieren, die in Vorstellungsgesprächen schwer zu zeigen ist: **operative Reife (Operational Maturity)**.

:::proof-note title="Ein Portfolio kann operative Reife belegen" label="beleg"
Es geht nicht nur um visuelle Perfektion. Es geht darum, Monitoring, Fallbacks, Belege und Fehlerverhalten auf derselben Oberfläche zu zeigen, die ein Personalverantwortlicher oder Käufer inspizieren kann.
:::

## Was "Produktionsreifes Portfolio" bedeutet

Meine Portfolio-Seite (sageideas.dev) hat:

- **SLO-Ziele:** 99,9 % Dashboard-Verfügbarkeit, <24h Telemetrie-Aktualität, <500ms P95-Antwortzeit
- **Incident Drills:** 4 Fehlerszenarien mit dokumentierten Reaktionen getestet
- **WAF-Ratenbegrenzung:** CloudFront Web ACL mit Angriffssimulationsnachweisen
- **OIDC-Föderation:** GitHub Actions → AWS ohne statische Anmeldedaten
- **Qualitätstelemetrie:** Live-Dashboard, das CI-Artefakte in Echtzeit abruft
- **Sicherheitsbelege:** IAM-Richtlinien, Bedrohungsmodelle und Nachweise für jede Behauptung

## Warum der Aufwand?

Weil die Lücke zwischen "Ich kann Dinge bauen" und "Ich kann Dinge betreiben" der Ort ist, an dem Senior-Rollen leben.

Junior-Entwickler bauen Features. Mid-Level-Entwickler bauen Systeme. Senior-Entwickler **betreiben** Systeme – sie denken über Fehlermodi, Schadensradius, Kosten, Compliance und das Szenario um 3 Uhr morgens nach.

Indem ich mein Portfolio wie eine Produktionsumgebung behandle, zeige ich:

1. **Ich denke über Fehler nach, bevor sie passieren** – jede externe Abhängigkeit hat einen Fallback
2. **Ich messe, was zählt** – SLOs, keine Eitelkeitsmetriken
3. **Ich dokumentiere für den Nächsten** – Runbooks, Playbooks, Architekturdokumente
4. **Ich mache keine Abstriche bei der Sicherheit** – selbst für eine Portfolio-Seite

## Das Incident-Drill-Muster

Jedes Quartal führe ich 4 Szenarien durch:

:::scorecard title="Portfolio Incident Drill" label="bewertung"
Szenario | Reaktion | Status
GitHub-API-Ratenbegrenzung | Fallback in Snapshot-Modus | Getestet
Fehlendes CI-Artefakt | Aktuelle Läufe scannen, graziös degradieren | Getestet
AWS-Proxy-Token-Konflikt | CloudWatch-Alarm, automatische Degradierung | Getestet
Fehlendes S3-Objekt | Fail-Closed, keine Geheimnislecks | Getestet
:::

| Szenario | Reaktion | Status |
|---|---|---|
| GitHub-API-Ratenbegrenzung | Fallback in Snapshot-Modus | Getestet |
| Fehlendes CI-Artefakt | Aktuelle Läufe scannen, graziös degradieren | Getestet |
| AWS-Proxy-Token-Konflikt | CloudWatch-Alarm, automatische Degradierung | Getestet |
| Fehlendes S3-Objekt | Fail-Closed, keine Geheimnislecks | Getestet |

Jeder Drill folgt dem Schema: **Erkennen → Priorisieren → Eindämmen → Verifizieren → Dokumentieren**

Der Drill-Bericht ist öffentlich in meiner Artefakt-Bibliothek verfügbar.

## Was Personalverantwortliche bemerken

Wenn ich mich für Senior-/Staff-Rollen bewerbe, spreche ich nicht über das Design meines Portfolios. Ich spreche über seinen Betrieb:

- "Hier ist mein SLO-Dashboard. Wir liegen diesen Monat bei 99,94 %."
- "Hier ist ein WAF-Ratenbegrenzungstest, den ich letzte Woche durchgeführt habe. 429er werden bei 100 Anfragen/5 Min. ausgelöst."
- "Hier ist die IAM-Richtlinie. Die Lambda hat genau eine Berechtigung: s3:GetObject auf einen Schlüssel."

Das verlagert das Gespräch von "Kannst du coden?" zu "Kannst du Systeme betreiben?" – was $200K+-Rollen tatsächlich erfordern.

## Wie du das selbst umsetzt

Du brauchst kein AWS. Fang klein an:

1. **Definiere ein SLO** – "Meine Seite wird diesen Monat 99 % Verfügbarkeit haben." Überwache es.
2. **Füge ein Qualitätstor hinzu** – Lighthouse CI in deiner Deployment-Pipeline. Schlage den Build fehl, wenn die Performance sinkt.
3. **Dokumentiere einen Fehlermodus** – "Was passiert, wenn mein API-Schlüssel abläuft?" Schreibe die Antwort auf.
4. **Führe einen Incident Drill durch** – Mach etwas absichtlich kaputt und übe die Reaktion.

Das Ziel ist nicht Perfektion. Es geht darum zu zeigen, dass du über Produktion nachdenkst, nicht nur über Entwicklung.

:::offer-cta title="Brauchst du diese Art von Nachweisschicht?" label="nächster schritt" href="/tools/route-finder" cta="Finde deinen Weg"
Nutze den Route Finder, um zu entscheiden, ob deine Seite ein Audit, ein Nachweissystem, Academy-Support oder einen kompletten Neubau benötigt.
:::

Verwandtes System: [Was ein KI-natives Studio tatsächlich baut](/blog/what-an-ai-native-studio-actually-builds) erklärt, warum das Portfolio gleichzeitig als Produktoberfläche, Betriebssystem und Wachstumsmotor behandelt wird.
