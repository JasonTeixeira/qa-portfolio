---
title: "Der Fall gegen Over-Engineering (von jemandem, der es getan hat)"
excerpt: "Ich habe einmal eine Plugin-Architektur für ein System gebaut, das nie Plugins brauchte. 3 Wochen Abstraktionsebenen für eine Funktion, nach der niemand gefragt hat. So habe ich gelernt, damit aufzuhören."
sourceSlug: the-case-against-over-engineering-from-someone-who
locale: de
machineTranslated: true
---

# Das Argument gegen Over-Engineering (von jemandem, der es selbst betrieben hat)

Ich muss etwas gestehen. Im Jahr 2023 habe ich drei Wochen damit verbracht, ein Plugin-System für ein Testautomatisierungs-Framework zu bauen. Konfigurierbare Test-Runner. Hot-reloadable Plugins. Ein Dependency-Injection-Container. Das volle Programm.

Niemand hat jemals ein Plugin geschrieben.

Das Framework lief in CI immer mit derselben Konfiguration. Die "Erweiterbarkeit", die ich gebaut hatte, wurde von genau null Personen genutzt. Ich hätte das gesamte Ding in 4 Tagen ausliefern können – ohne die Plugin-Architektur.

## Wie Over-Engineering entsteht

Es beginnt mit einem vernünftigen Gedanken: "Was, wenn wir das später erweitern müssen?"

Dieser Gedanke ist die Falle. Denn "später" sieht selten so aus, wie du es dir vorgestellt hast, und die Abstraktionen, die du für imaginäre Anforderungen baust, stehen meist den echten im Weg.

So habe ich den Verlauf bei mir selbst beobachtet:

1. Eine einfache Funktion bauen ✅
2. Denken: "Das sollte konfigurierbar sein" ⚠️
3. Ein Konfigurationsobjekt hinzufügen
4. Denken: "Verschiedene Umgebungen brauchen vielleicht unterschiedliche Implementierungen" ⚠️
5. Ein Interface und Factory-Pattern hinzufügen
6. Denken: "Wir könnten das zur Laufzeit austauschen müssen" 🚩
7. Dependency Injection hinzufügen
8. Erkennen, dass noch nie jemand es austauschen musste
9. Die Abstraktion für immer warten, weil das Entfernen schwieriger ist als das Behalten

## Die drei Fragen

Bevor ich eine Abstraktion hinzufüge, frage ich mich jetzt:

**1. "Hat das tatsächlich jemand verlangt?"**

Wenn die Antwort "nein, aber vielleicht" lautet – bau es nicht. YAGNI (You Aren't Gonna Need It) ist das am meisten verletzte Prinzip in der Softwareentwicklung.

**2. "Was kostet es, das später hinzuzufügen, im Vergleich zu jetzt?"**

Wenn ich die Abstraktion in 2 Stunden hinzufügen kann, wenn sie tatsächlich gebraucht wird, gibt es keinen Grund, sie jetzt "nur für den Fall" zu bauen. Die Kosten vorzeitiger Abstraktion (Code warten, den niemand nutzt) sind fast immer höher als die Kosten, sie später hinzuzufügen.

**3. "Kann ich in einem Satz erklären, warum das existiert?"**

"Wir verwenden Dependency Injection, weil wir den Zahlungsanbieter in verschiedenen Umgebungen zwischen Stripe und Braintree wechseln müssen." Das ist ein echter Grund.

"Wir verwenden Dependency Injection, weil es Best Practice ist." Das ist kein Grund. Das ist Cargo Culting.

## Wie einfacher Code aussieht

\\\
