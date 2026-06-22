---
title: "Fehlerbehandlung, die Ihre Benutzer respektiert"
excerpt: "Ihre Benutzer interessieren sich nicht für Stack-Traces. Sie wollen wissen, was schiefgelaufen ist und was als Nächstes zu tun ist. So gestalte ich Fehlererlebnisse, die helfen statt frustrieren."
sourceSlug: error-handling-that-respects-your-users
locale: de
machineTranslated: true
---

# Fehlerbehandlung, die Ihre Nutzer respektiert

Die meiste Fehlerbehandlung ist für die Entwicklerin geschrieben, die das System bereits kennt.

Das ist falsch herum.

Die Nutzerin interessiert sich nicht dafür, dass ein Stripe-Webhook eine Zeitüberschreitung hatte, eine Supabase-Richtlinie die Zeile abgelehnt hat oder ein Modellanbieter einen 429 zurückgegeben hat. Sie interessiert sich für drei Dinge:

- was passiert ist
- ob ihre Arbeit sicher ist
- was sie als Nächstes tun kann

Wenn die Oberfläche diese Fragen nicht beantworten kann, hilft die Fehlermeldung nicht. Sie gibt nur Implementierungsdetails preis.

:::proof-note title="Der Standard, den ich verwende" label="Operator-Regel"
Ein Fehlerzustand ist Teil der Produktoberfläche. Er sollte mit derselben Sorgfalt gestaltet werden wie der glückliche Pfad, denn er ist oft der Moment, in dem Vertrauen entweder geschützt oder verloren wird.
:::

## Beginnen Sie mit der Aufgabe der Nutzerin, nicht mit der Ausnahme

Der erste Entwurf einer Fehlermeldung klingt meist wie der Codepfad:

> Fehler beim Erstellen der Checkout-Sitzung.

Das mag stimmen, ist aber nicht hilfreich. Eine bessere Version beginnt mit der Absicht der Nutzerin:

> Wir konnten den Checkout nicht öffnen. Ihre Projektdetails wurden gespeichert. Versuchen Sie es erneut, oder buchen Sie einen Anruf, und wir erledigen es manuell.

Diese Nachricht erfüllt vier Aufgaben:

- benennt die fehlgeschlagene Aktion
- bestätigt, ob Daten gespeichert wurden
- gibt einen nächsten Schritt vor
- vermeidet, die Nutzerin zu beschuldigen

Der interne Fehler kann weiterhin mit dem Anbieter, dem Statuscode, der Anfrage-ID und dem Stacktrace protokolliert werden. Die Nutzerin braucht das alles nicht.

## Trennen Sie Nutzertexte von technischer Telemetrie

Die Produktoberfläche und die Beobachtbarkeitsoberfläche sollten nicht dieselbe Nutzlast tragen.

:::system-diagram title="Respektvoller Fehlerablauf" label="Oberfläche -> Telemetrie" nodes="Nutzeraktion,Fehlergrenze,Nutzertext,Telemetrie"
Die Nutzerin sieht einen klaren Wiederherstellungspfad. Das System behält den Stacktrace, die Anfrage-ID, die Anbieterantwort und die Alarmweiterleitung für die Operatorin.
:::

In der Produktion möchte ich zwei Ausgaben von demselben Fehler:

- eine menschenlesbare Nachricht auf der Seite
- ein maschinenlesbares Ereignis in Logs, Analysen und Alarmierungen

Der Nutzertext sollte ruhig und spezifisch sein. Die Telemetrie darf, falls nötig, dicht und hässlich sein. Beides zu vermischen erzeugt entweder nutzlose Logs oder feindselige Oberflächen.

## Gute Fehlerzustände beantworten fünf Fragen

Wenn ich einen Fehlerzustand überprüfe, gehe ich diese Checkliste durch.

:::checklist title="Checkliste für Fehlerzustände" label="UX-QA"
- Sagt es, welche Aktion fehlgeschlagen ist?
- Sagt es, ob die Daten der Nutzerin sicher sind?
- Bietet es einen realistischen nächsten Schritt?
- Vermeidet es die Preisgabe von Geheimnissen, Stacktraces oder Anbieterinterna?
- Erfasst die Telemetrie genügend Details, damit die Operatorin es debuggen kann?
:::

Wenn die Antwort Nein ist, ist der Zustand nicht fertig.

Ein Lead-Formular-Fehler sollte beispielsweise nicht `500 Interner Serverfehler` sagen. Er sollte eher so lauten:

> Wir konnten die Nachricht nicht senden. Ihr Browser blieb auf dieser Seite, also ging nichts verloren. Versuchen Sie es erneut oder mailen Sie die Projektdetails direkt.

Dann sollten die Serverlogs die eigentliche Ursache enthalten: Validierungsfehler, Resend-Timeout, Supabase-Insert-Fehler oder Webhook-Ablehnung.

## Entwerfen Sie den Fallback, bevor das System ausfällt

Teams fügen Fallback-Zustände normalerweise nach dem ersten Produktionsvorfall hinzu. Das ist teuer, weil der Fehler bereits öffentlich ist.

Für wichtige Abläufe definiere ich den Fallback gerne während der Entwicklung der Funktion:

| Ablauf | Nutzer-Fallback | Operator-Signal |
|---|---|---|
| Checkout | Route speichern, Buchungslink anbieten | Zahlungsanbieterfehler mit Sitzungsmetadaten |
| Kontaktformular | Nachricht auf dem Bildschirm behalten, direkte E-Mail anzeigen | Lead-Erfassungsfehler mit Quelle und Payload-Form |
| KI-Generierung | Prompt erhalten, Wiederholung anbieten | Anbieter, Modell, Latenz und Token-Metadaten |
| Datei-Upload | Dateilimit und Wiederholungspfad anzeigen | Speicherfehler, Größe, MIME-Typ, Organisations-ID |

Der Fallback muss nicht ausgefallen sein. Er muss die Dynamik erhalten.

## Lassen Sie nicht jeden Fehler gleich klingen

Allgemeine Nachrichten lassen das Produkt nachlässig wirken:

- Etwas ist schiefgelaufen.
- Versuchen Sie es später noch einmal.
- Ein unerwarteter Fehler ist aufgetreten.

Manchmal sind diese als letzte Auffangnetze akzeptabel, aber sie sollten nicht die einzige Fehlersprache im Produkt sein.

Verschiedene Fehler benötigen unterschiedliche Wiederherstellungspfade:

- Validierungsfehler: Zeigen Sie das genaue Feld und das erwartete Format an
- Berechtigungsfehler: Erklären Sie, welche Rolle oder welches Konto erforderlich ist
- Ratenbegrenzung: Sagen Sie, wann ein erneuter Versuch möglich ist, oder bieten Sie eine leichtere Aktion an
- Abhängigkeitsfehler: Bewahren Sie die Arbeit der Nutzerin und zeigen Sie einen alternativen Pfad
- Fehler bei destruktiven Aktionen: Geben Sie klar an, was sich nicht geändert hat

Das Ziel ist nicht, das System perfekt aussehen zu lassen. Das Ziel ist, die Nutzerin orientiert fühlen zu lassen, wenn es das nicht ist.

:::scorecard title="Qualität der Fehlertexte" label="Bewertungstabelle"
Muster | Schwach | Stark
Validierung | Ungültige Eingabe | Verwenden Sie eine geschäftliche E-Mail oder entfernen Sie nicht unterstützte Zeichen
Anbieterfehler | Checkout fehlgeschlagen | Checkout wurde nicht geöffnet. Ihre Projektdetails sind gespeichert.
Berechtigung | Nicht autorisiert | Sie benötigen Admin-Zugriff, um die Abrechnungseinstellungen zu ändern
Ratenbegrenzung | Zu viele Anfragen | Warten Sie 60 Sekunden, bevor Sie eine weitere Prüfung durchführen
Unbekannt | Etwas ist schiefgelaufen | Wir konnten diese Aktion nicht abschließen. Ihr Entwurf ist noch da.
:::

## Die Operatorin braucht eine andere Oberfläche

Respektvolle nutzerseitige Texte funktionieren nur, wenn die Operatorin trotzdem die echten Beweise erhält.

Das bedeutet Protokollierung von:

- Route und Aktion
- Anfrage-ID oder Trace-ID
- Nutzer-/Organisations-ID, wenn verfügbar
- Anbieter und Statuscode
- sichere Payload-Form
- Zeitmessung
- Anzahl der Wiederholungen

Es bedeutet auch, keine Geheimnisse, rohen Tokens, Zahlungskartendaten, privaten Dokumente oder vollständigen Prompts zu protokollieren, wenn diese Prompts Kundendaten enthalten könnten.

Gute Fehlerbehandlung ist keine weichere Protokollierung. Es ist eine schärfere Trennung.

## Das Muster, das ich auszuliefern versuche

Für jede wichtige Aktion möchte ich diese Form:

1. Frühzeitig validieren und feldbezogene Anleitung zeigen.
2. Die Serveraktion/API-Route in eine strukturierte Fehlerbehandlung einwickeln.
3. Eine stabile Nutzernachricht und einen stabilen Maschinencode zurückgeben.
4. Den vollständigen, für die Operatorin sicheren Kontext protokollieren.
5. Den Fehler als Produktereignis verfolgen, wenn er die Konversion beeinflusst.
6. Nutzereingaben wo immer möglich erhalten.

Das ist keine glamouröse Arbeit, aber es ist Teil des Premium-Gefühls. Die Seite, die Ihre Arbeit speichert und Ihnen sagt, was als Nächstes zu tun ist, wirkt vertrauenswürdiger als die Seite, die ein rotes Kästchen aufblitzen lässt und Sie von vorne beginnen lässt.

:::offer-cta title="Sollen die Fehlerpfade geprüft werden?" label="Nächster Schritt" href="/tools/route-finder" cta="Finden Sie Ihre Route"
Nutzen Sie den Route Finder, um zu entscheiden, ob Ihr Produkt einen Studio-Build, einen Audit-Sprint, einen Automatisierungsumfang oder einen Academy-Pfad benötigt.
:::
