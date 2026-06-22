---
title: "Wie man KI-Funktionen vor der Auslieferung bewertet"
excerpt: "Ein praktischer Bewertungszyklus für KI-Funktionen: das Versprechen definieren, eine Fehlermenge aufbauen, die langweiligen Fälle testen und einen Menschen im Loop behalten, bis das System Vertrauen verdient."
sourceSlug: how-to-evaluate-ai-features-before-you-ship-them
locale: de
machineTranslated: true
---

# Wie man KI-Funktionen bewertet, bevor man sie ausliefert

Eine KI-Funktion ist nicht fertig, wenn sie in der Demo funktioniert.

Das ist die Falle. Du stellst drei freundliche Fragen, sie beantwortet zweieinhalb, alle sehen die Umrisse der Zukunft, und plötzlich steht im Produkt-Roadmap eine Funktion namens "KI-Assistent" an der Stelle, wo eigentlich ein Pflichtenheft stehen sollte.

Ich vertraue dieser Version des Prozesses nicht. Ich vertraue der langsameren: das Versprechen benennen, die Fehlerfälle aufschreiben, den langweiligen Pfad testen und einen Menschen in der Nähe behalten, bis das System beweist, dass es sich benehmen kann.

:::system-diagram title="KI-Bewertungsschleife" label="Versprechen -> Nachweis" nodes="Versprechen,Fehlerfälle,Review,Auslieferung"
Die Funktion wird nicht einmal bewertet. Sie durchläuft eine Schleife: das Versprechen definieren, die Fehlermenge aufbauen, echte Ausgaben prüfen und erst dann entscheiden, was ausgeliefert werden kann.
:::

## Beginne mit dem Versprechen

Die erste Frage ist nicht "Welches Modell sollen wir verwenden?"

Die erste Frage ist: Was darf der Benutzer glauben, nachdem diese Funktion geantwortet hat?

Dieser Satz ist wichtig. Wenn die Funktion ein Dokument zusammenfasst, glaubt der Benutzer, dass die Zusammenfassung treu ist. Wenn sie eine Support-Antwort entwirft, glaubt der Benutzer, dass sie keine Rückerstattungsrichtlinie erfindet. Wenn sie ein Handelssignal erklärt, glaubt der Benutzer, dass es sich nicht um eine Finanzberatung in freundlichem Ton handelt.

Schreibe das Versprechen in einem Satz:

- "Diese Funktion klassifiziert die Anfrage und leitet sie an den richtigen Workflow weiter."
- "Diese Funktion entwirft eine Antwort, die ein Mensch vor dem Senden freigibt."
- "Diese Funktion durchsucht interne Dokumente und zitiert die verwendete Quelle."

Wenn das Versprechen einen Absatz braucht, ist die Funktion noch nicht abgegrenzt.

## Baue die Fehlermenge vor dem Happy Path

Die meisten KI-Demos werden zufällig darauf trainiert, die Demo zu bestehen.

Der echte Bewertungssatz sollte die Eingaben enthalten, die das Produkt unangenehm finden:

- vage Anfragen
- widersprüchliche Anweisungen
- fehlender Kontext
- bösartiges Prompt Injection
- alte Richtliniendokumente
- doppelte Datensätze
- wütende Kundenmitteilungen
- Grenzfälle, die bei Fehlbehandlung Geld kosten

Für einen kundenorientierten KI-Workflow möchte ich mindestens 25 Beispiele, bevor ich der Form des Systems vertraue. Nicht 25 perfekte Benchmark-Zeilen. Fünfundzwanzig hässliche Beispiele, die die tatsächliche Arbeit repräsentieren.

Der Bewertungssatz ist kein Papierkram. Er ist die Grenze des Produkts.

## Trenne Modellqualität von Produktqualität

Ein Modell kann gut sein, und das Produkt kann trotzdem schlecht sein.

Das Modell könnte eine korrekte Antwort ohne Quellenangabe liefern. Der Workflow könnte das richtige Dokument zitieren, aber die wichtige Warnung verstecken. Die UI könnte die Antwort endgültig aussehen lassen, obwohl sie nur ein Entwurf ist.

Ich bewerte KI-Funktionen in Schichten:

1. Hat es die Aufgabe verstanden?
2. Hat es die richtige Quelle oder das richtige Werkzeug verwendet?
3. Hat es vermieden, Behauptungen außerhalb der Quelle aufzustellen?
4. Hat es das Ergebnis in einer Form zurückgegeben, mit der der Benutzer arbeiten kann?
5. Hat die UI die Zuversicht und die Grenzen des Systems deutlich gemacht?

Nur die ersten beiden sind meist Modellfragen. Der Rest sind Produktfragen.

## Behalte einen Menschen länger im Kreislauf, als es bequem erscheint

Die erste Produktionsversion eines KI-Workflows sollte normalerweise zuerst als Entwurf und nicht sofort gesendet werden.

Das klingt weniger magisch. Gut.

Entwurf-zuert gibt dir Review-Daten. Es zeigt, wo Benutzer die Ausgabe bearbeiten, wo sie sie ablehnen, welche Felder sie korrigieren und welche Aufgaben nie hätten automatisiert werden sollen.

Der menschliche Review-Schritt ist keine dauerhafte Krücke. Es ist Instrumentierung.

Wenn die Bearbeitungen vorhersehbar werden, automatisiere die Bearbeitung. Wenn die Ablehnungen sich um einen Eingabetyp häufen, ändere den Router. Wenn der Prüfer immer wieder dieselbe Quelle manuell überprüft, füge Abruf und Zitierung hinzu.

Du entfernst den Menschen nicht, weil die Demo funktioniert hat. Du entfernst den Menschen, wenn das Review-Protokoll sagt, dass das System es verdient hat.

## Die Auslieferungs-Checkliste

Bevor ich eine KI-Funktion ausliefere, möchte ich Folgendes an Ort und Stelle haben:

:::checklist title="KI-Funktions-Auslieferungs-Checkliste" label="Checkliste"
- Ein Ein-Satz-Versprechen.
- Ein Bewertungssatz mit hässlichen Beispielen.
- Bestehen/Nichtbestehen-Kriterien für jedes Beispiel.
- Protokollierung für Prompt, Tool-Aufrufe, Quellen und Ergebnis.
- Ein menschlicher Review-Pfad für risikoreiche Ausgaben.
- Ein Fallback, wenn das Modell nicht verfügbar ist.
- Eine Möglichkeit, schlechte Ausgaben aus der UI zu melden.
:::

- ein Ein-Satz-Versprechen
- ein Bewertungssatz mit hässlichen Beispielen
- Bestehen/Nichtbestehen-Kriterien für jedes Beispiel
- Protokollierung für Prompt, Tool-Aufrufe, Quellen und Ergebnis
- ein menschlicher Review-Pfad für risikoreiche Ausgaben
- ein Fallback, wenn das Modell nicht verfügbar ist
- eine Möglichkeit, schlechte Ausgaben aus der UI zu melden

Nichts davon macht die Funktion weniger beeindruckend.

Es macht die Funktion real.

:::offer-cta title="Brauchen Sie eine KI-Funktion vor dem Start bewertet?" label="nächster Schritt" href="/tools/route-finder" cta="Finden Sie Ihren Weg"
Nutzen Sie den Route Finder, um zu entscheiden, ob dies ein KI-Audit, ein Automatisierungsumfang, ein Academy-Pfad oder ein vollständiger Produktbau benötigt.
:::

Verwandtes System: [Das KI-Implementierungs-Audit vor dem Bau](/blog/the-ai-implementation-audit-before-you-build) zerlegt dieselbe Idee in einen Pre-Build-Audit-Pfad für Teams, die entscheiden, was zuerst automatisiert werden soll.
