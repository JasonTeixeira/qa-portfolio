---
title: "Das technische Vorstellungsgespräch von beiden Seiten des Tisches"
excerpt: "Ich war sowohl der Kandidat, der sich durch Systemdesign-Fragen schwitzte, als auch der Interviewer, der sie bewertete. Die Kluft zwischen dem, worauf Interviewer achten, und dem, worauf sich Kandidaten vorbereiten, ist enorm."
sourceSlug: the-technical-interview-from-both-sides-of-the-table
locale: de
sourceHash: 359005b5fa6fb432
machineTranslated: true
---

# Das technische Vorstellungsgespräch von beiden Seiten des Tisches

Ich saß auf beiden Seiten. Ich habe Systemdesigns auf Whiteboards skizziert, während ein Interviewer schweigend nickte. Ich war auch derjenige, der nickte und zusah, wie ein Kandidat ein Benachrichtigungssystem auf einem Whiteboard entwarf.

Die Kluft zwischen dem, was Kandidaten vorbereiten, und dem, was Interviewer tatsächlich bewerten, ist erschütternd.

## Was Kandidaten vorbereiten

- LeetCode-Schwerpunktaufgaben
- Obskure Algorithmus-Trivia
- "Erzählen Sie mir von einer Situation, in der..."
- Auswendig gelernte Systemdesign-Antworten

## Was Interviewer tatsächlich bewerten

- **Wie Sie mit Ambiguität umgehen.** Das Erste, was ich tue, wenn ich ein Systemdesign-Problem bekomme, ist, klärende Fragen zu stellen. "Wie viele Nutzer? Welche Latenzanforderungen? Welches Budget?" Kandidaten, die anfangen, Boxen zu zeichnen, bevor sie Fragen stellen, sind ein Warnsignal. Sie bauen, ohne die Anforderungen zu verstehen – und werden das Gleiche im Job tun.

- **Bewusstsein für Trade-offs.** Es gibt keine perfekte Architektur. Jede Entscheidung hat ihren Preis. Wenn ein Kandidat sagt "wir sollten Kafka für die Message Queue verwenden", frage ich "warum nicht SQS?" Wenn sie den Trade-off artikulieren können (Kafka: höherer Durchsatz, mehr Betriebsaufwand, bessere Wiederholbarkeit; SQS: einfacher, verwaltet, für die meisten Fälle gut genug), verstehen sie Engineering. Wenn sie sagen "Kafka ist Industriestandard", betreiben sie Cargo Culting.

- **Denken in Fehlermodi.** "Was passiert, wenn dieser Dienst ausfällt?" Wenn die Antwort "er wird nicht ausfallen" lautet, weiß ich, dass sie noch nie ein System in Produktion betrieben haben. Alles fällt aus. Die Frage ist, ob Sie dafür ausgelegt haben.

- **Kommunikationsklarheit.** Können Sie Ihr Design einer nicht-technischen Person im Raum erklären? Senior-Rollen beinhalten die Kommunikation mit Produktmanagern, Designern und Führungskräften. Wenn Sie Ihr System nur anderen Ingenieuren erklären können, haben Sie Ihre Grenze erreicht.

## Die Fragen, die ich stelle (und was ich wirklich teste)

**"Gehen Sie mit mir ein aktuelles Projekt durch, auf das Sie stolz sind."**

Ich teste: Können Sie eine kohärente Geschichte erzählen? Erwähnen Sie Einschränkungen, nicht nur Technologie? Geben Sie Ihrem Team Anerkennung oder nehmen Sie alle Anerkennung? Erwähnen Sie, was Sie anders machen würden?

**"Sie erhalten 500-Fehler in der Produktion. Gehen Sie mit mir Ihren Debugging-Prozess durch."**

Ich teste: Haben Sie einen systematischen Ansatz oder raten Sie? Überprüfen Sie zuerst Logs und Metriken oder fangen Sie an, Code zu ändern? Denken Sie über die Auswirkungsreichweite nach?

**"Entwerfen Sie ein System für [X]. Sie haben 45 Minuten."**

Ich teste: Stellen Sie zuerst Fragen? Beginnen Sie mit Anforderungen oder mit Technologie? Erwähnen Sie Monitoring, Fehlerbehandlung und Skalierung – oder nur den Happy Path?

## Was sich änderte, als ich anfing zu interviewen

Als Kandidat dachte ich, der Interviewer wolle die "richtige Antwort". Als Interviewer lernte ich, dass es keine richtige Antwort gibt. Ich bewerte Ihren Denkprozess.

Der Kandidat, der ein einfaches System entwirft, seine Grenzen anerkennt und erklärt, wann er Komplexität hinzufügen würde, ist stärker als der Kandidat, der ein komplexes System entwirft, das er nicht erklären kann.

## Mein Rat (von beiden Seiten)

**Für Kandidaten:**
1. Stellen Sie 3-5 klärende Fragen, bevor Sie etwas entwerfen
2. Beginnen Sie einfach und fügen Sie Komplexität hinzu, wenn danach gefragt wird
3. Erwähnen Sie Fehlermodi unaufgefordert ("wenn dieser Dienst ausfällt, passiert Folgendes")
4. Erklären Sie Trade-offs für jede größere Entscheidung
5. Seien Sie ehrlich, was Sie nicht wissen – "Ich habe Kafka nicht im großen Maßstab genutzt, aber ich verstehe die Durchsatzvorteile. Für diesen Anwendungsfall würde ich mit SQS beginnen und migrieren, wenn wir Wiederholbarkeit brauchen"

**Für Interviewer:**
1. Testen Sie nicht spezifisches Technologiewissen – testen Sie Engineering-Urteilsvermögen
2. Fragen Sie "was würden Sie anders machen?" – die besten Ingenieure haben starke Meinungen zu ihrer eigenen Arbeit
3. Geben Sie Kandidaten Raum, sich von Fehlern zu erholen – wie sie mit dem Falschliegen umgehen, sagt mehr aus, als wenn sie es richtig machen

Die besten Vorstellungsgespräche fühlen sich wie Arbeitssitzungen an. Die schlimmsten fühlen sich wie Verhöre an. Gestalten Sie für Ersteres.
