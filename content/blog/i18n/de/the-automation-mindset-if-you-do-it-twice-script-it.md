---
title: "Der Automatisierungs-Mindset: Wenn du es zweimal machst, skripte es"
excerpt: "Ich habe 47 Shell-Skripte, 6 CI-Workflows und einen Cron-Job, der mir eine SMS schickt, wenn mein SSL-Zertifikat abläuft. Hier ist der Mindset hinter der Automatisierung von allem."
sourceSlug: the-automation-mindset-if-you-do-it-twice-script-it
locale: de
sourceHash: a728d62c64798390
machineTranslated: true
---

# Die Automatisierungs-Denkweise: Wenn du es zweimal machst, skripte es

Letzten Dienstag habe ich eine Datenbankmigration durchgeführt, 3 API-Endpunkte getestet, die Stripe-Webhook-Logs überprüft, die CI-Pipeline auf Grün bestätigt und in die Produktion deployed. Gesamtzeit: 4 Minuten.

Früher hat das 45 Minuten gedauert.

Der Unterschied liegt nicht darin, dass ich schneller geworden bin beim Klicken. Sondern darin, dass ich ganz aufgehört habe zu klicken.

## Die Regel

**Wenn ich etwas zweimal manuell mache, automatisiere ich es beim dritten Mal.**

Nicht „wenn ich Zeit habe.“ Nicht „nächster Sprint.“ Das dritte Mal. Denn das vierte Mal kommt – und das fünfte und das hundertste.

## Mein Automatisierungs-Stack

### Deploy-Skript (ersetzt 12 manuelle Schritte)

\\\
