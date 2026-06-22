---
title: "Erstellen einer Produktoberfläche und Systemkarte"
excerpt: "Ein Produkt lässt sich einfacher bauen, verkaufen und vermitteln, wenn Sie die sichtbare Oberfläche vom darunterliegenden Betriebssystem trennen."
sourceSlug: build-a-product-surface-and-system-map
locale: de
machineTranslated: true
---

# Erstellen einer Produktoberfläche und Systemkarte

Ein Produkt wird einfacher zu bauen, wenn man es nicht mehr als einen Haufen Bildschirme betrachtet.

Beginne mit zwei Karten:

1. der Oberflächenkarte
2. der Systemkarte

Die Oberflächenkarte zeigt, was Menschen berühren.

Die Systemkarte zeigt, was es zum Funktionieren bringt.

:::system-diagram title="Produktbaukarte" label="Oberfläche <-> System" nodes="Oberfläche,Zustand,Regeln,Nachweis"
Die Oberfläche ist das, was der Benutzer sieht. Zustand, Regeln, Integrationen und Nachweise sind das, was die Oberfläche glaubwürdig und unterstützbar macht.
:::

## Die Oberflächenkarte

Die Oberflächenkarte benennt die benutzerseitigen Abläufe.

Für ein SaaS-Produkt könnte das Folgendes umfassen:

- Startseite
- Registrierung
- Einführung
- Dashboard
- Abrechnung
- Einstellungen
- Berichte
- Support

Für ein internes Tool könnte es Folgendes umfassen:

- Aufnahmeformular
- Arbeitswarteschlange
- Detailseite
- Genehmigungsbereich
- Admin-Dashboard
- Export

Die Oberflächenkarte hilft dir zu erkennen, was das Produkt vom Benutzer verlangt.

## Die Systemkarte

Die Systemkarte benennt die Betriebsebene:

- Authentifizierung
- Rollen
- Datenmodell
- Hintergrundjobs
- Integrationen
- Ereignisse
- Analysen
- Abrechnung
- Berechtigungen
- Fehlerbehandlung
- Prüfprotokoll

Hier unterschätzen Entwickler oft den Umfang.

Sie entwerfen das Dashboard und vergessen die Warteschlange.

Sie schreiben den KI-Prompt und vergessen die Evaluierung.

Sie bauen den Checkout und vergessen den Webhook-Wiederholungsversuch.

:::proof-note title="Nexural-Beispiel" label="Beleg"
Nexural ist als Referenz nützlich, weil die Oberfläche sichtbar ist, aber die wichtige Arbeit darunter liegt: 185 Datenbanktabellen, 69 API-Endpunkte, Stripe-Abrechnung, Echtzeit-Workflows, Discord-KI und 61 Testsuiten.
:::

## Zeichne den Fehlerpfad

Eine gute Systemkarte enthält, was passiert, wenn etwas schiefgeht.

Beispiele:

- Zahlung schlägt fehl
- Webhook-Wiederholungsversuche
- Modell verweigert
- Benutzer hat keine Berechtigung
- Quelldaten sind veraltet
- Integration läuft aus
- Admin muss eingreifen
- E-Mail wird zurückgewiesen

Wenn ein Produkt keinen Fehlerpfad hat, ist es immer noch eine Demo.

:::checklist title="Checkliste für die Systemkarte" label="Bauvorbereitung"
- Was sind die primären Benutzerabläufe?
- Welche Daten liest oder schreibt jeder Ablauf?
- Welche Berechtigungen steuern die Aktion?
- Welcher Hintergrundjob oder welche Integration läuft nach dem Klick?
- Was passiert, wenn es fehlschlägt?
- Welcher Nachweis zeigt uns, dass das System funktioniert?
:::

## Verwandle die Karte in eine Bauabfolge

Die Systemkarte sollte die Bauabfolge bestimmen.

Normalerweise:

1. Datenmodell
2. Authentifizierung und Rollen
3. Kernablauf
4. Oberfläche
5. Integrationen
6. Analysen
7. Nachweise und Dokumentation

Diese Abfolge ist weniger aufregend, als mit dem glänzenden Bildschirm zu beginnen. Sie ist auch haltbarer.

:::scorecard title="Oberflächenorientierter vs. systemgeführter Bau" label="Akademie"
| Ebene | Oberflächenorientiert | Systemgeführt |
| --- | --- | --- |
| UI | hübscher Bildschirm | nutzbarer Ablauf |
| Daten | Ad-hoc-Felder | benanntes Modell |
| KI | Prompt-Feld | eval-gesteuerter Assistent |
| Abrechnung | Checkout-Button | Lebenszyklus-Handling |
| Start | Bauchgefühl | Nachweistafel |
:::

## Warum dies für die Academy wichtig ist

Der Academy-Pfad sollte dieses Modell direkt vermitteln.

DIY-Entwickler brauchen nicht nur Tipps.

Sie müssen lernen, wie man eine Idee in eine Produktoberfläche, Systemkarte, Nachweistafel und Wachstumsschleife verwandelt.

Das ist der Unterschied zwischen „Ich habe ein Ding gemacht“ und „Ich habe ein System gebaut“.

:::offer-cta title="Lerne das Betriebsmodell" label="Academy-Route" href="/academy" cta="Erkunde die Academy"
Wenn du selbst auf diese Weise bauen möchtest, sollte die Academy-Route mit Produktoberfläche, Systemkarte, Nachweis und Launch-Distribution beginnen.
:::
