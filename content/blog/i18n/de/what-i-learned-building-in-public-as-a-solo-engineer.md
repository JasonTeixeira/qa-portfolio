---
title: "Was ich als Solo-Entwickler beim öffentlichen Bauen gelernt habe"
excerpt: "Ein Jahr Aufbau des Nexural-Ökosystems, Futures-Handel, Schreiben eines Buches und Dokumentieren von allem. Die Erfolge, die Misserfolge und was ich jemandem sagen würde, der heute anfängt."
sourceSlug: what-i-learned-building-in-public-as-a-solo-engineer
locale: de
machineTranslated: true
---

# Was ich als Solo-Entwickler beim öffentlichen Bauen gelernt habe

Vor einem Jahr habe ich meine Rolle bei HighStrike aufgegeben und Sage Ideas LLC gegründet. Seitdem habe ich eine Fintech-Plattform mit 185 Datenbanktabellen, einen KI-gestützten Discord-Bot, ein ML-Trading-Signalsystem, ein 120.000 Wörter umfassendes Buch über Trading und diese Portfolio-Seite gebaut.

Hier ist, was ich gelernt habe.

## Die Einsamkeit ist real

Solo-Engineering bedeutet:
- Keine Code-Reviews (du reviewst deinen eigenen Code)
- Keine Architekturdiskussionen (du argumentierst mit dir selbst)
- Niemand, der deine blinden Flecken erkennt (du entdeckst sie in der Produktion)
- Niemand, der Erfolge mit dir feiert (du pushst auf main und machst weiter)

Die Lösung: Ich begann, meine Entscheidungen zu dokumentieren. Jede große Architekturentscheidung bekommt eine Markdown-Datei, die erklärt, was ich gewählt habe und warum. Es ist ein Gespräch mit meinem zukünftigen Ich – und jetzt ist es Content für mein Portfolio.

## Wöchentlich ausliefern, nicht monatlich

In meinen ersten 3 Monaten baute ich 4 Wochen lang, bevor ich deployed habe. Ich fand Bugs, stellte fest, dass ich das Falsche gebaut hatte, und verschwendete Tage mit Refactoring.

Jetzt liefere ich jede Woche aus. Manchmal jeden Tag. Kleine Deployments bedeuten:
- Weniger Risiko pro Deployment
- Schnelleres Feedback
- Einfachere Rollbacks
- Sichtbarer Fortschritt (entscheidend für die Motivation)

## Das 80/20-Prinzip des Solo-Engineerings

**20 % der Arbeit, die 80 % des Werts ausmachen:**
- Datenbank-Schemadesign (mach das richtig, und alles nachgelagerte wird einfacher)
- API-Contract-Definition (Zod-Schemata fangen 90 % der Integrationsfehler ab)
- CI/CD-Einrichtung (automatisierte Deployments = du lieferst mehr aus)
- Fehlerüberwachung (Bugs kennen, bevor Nutzer sie melden)

**80 % der Arbeit, die 20 % des Werts ausmachen:**
- Pixelgenaues UI (Nutzer kümmern sich um Funktion, nicht um Schriftstärke)
- Performance-Optimierung, bevor du Nutzer hast
- Tests für Code schreiben, der nächste Woche geändert wird
- Den "perfekten" Tech-Stack auswählen

## Die finanzielle Realität

Ich bin ein aktiver Futures-Trader. Trading-Einkommen finanziert das Bauen. Das ist ein Luxus, den die meisten Solo-Entwickler nicht haben.

Ohne Trading-Einkommen hätte ich gebraucht:
- Mindestens 6 Monate Ersparnisse
- Einen klaren Monetarisierungspfad vor dem Bauen
- Zahlende Kunden vor dem Bauen von Features

Öffentlich zu bauen ohne Umsatzdruck ist ein Privileg. Öffentlich zu bauen MIT Umsatzdruck ist Unternehmertum. Sie erfordern unterschiedliche Strategien.

## Was mich tatsächlich eingestellt hat (Interviews und Interesse)

Nach all dem Bauen ist hier, woran Einstellungsmanager und potenzielle Kunden tatsächlich interessiert sind:

1. **"Du hast eine Plattform mit 185 Tabellen gebaut?"** – Größe beeindruckt. Nicht die Zahl selbst, sondern die Tatsache, dass ich sie solo entworfen und verwaltet habe.

2. **"Du handelst die gleichen Instrumente, die deine Software analysiert?"** – Domain-Expertise ist selten. Die meisten Fintech-Entwickler nutzen ihre eigenen Produkte nicht.

3. **"Wo ist die Live-Demo?"** – Das Qualitäts-Dashboard auf meiner Portfolio-Seite hat mehr Gespräche gestartet als mein Lebenslauf. Leute können es in Aktion sehen.

4. **"Du hast ein 120.000-Wörter-Buch geschrieben?"** – Das signalisiert Engagement, tiefes Denken und Kommunikationsfähigkeiten. Niemand schreibt 120.000 Wörter beiläufig.

5. **"Zeig mir das GitHub"** – Sie wollen echten Code, echte Commits, echte CI-Pipelines sehen. Keine polierte Portfolio-Seite – das tatsächliche Repository.

## Was ich jemandem sagen würde, der heute anfängt

1. **Wähle eine Sache und liefer sie aus.** Baue keine "Plattform". Baue ein einzelnes Feature, deploye es und zeig es einer Person. Dann baue das nächste Feature.

2. **Dokumentiere obsessiv.** Deine Dokumentation ist dein Portfolio. Deine Commit-Nachrichten sind dein Arbeitslog. Deine Architektur-Dokumente sind deine Fallstudien.

3. **Baue, was du selbst nutzt.** Ich habe Trading-Tools gebaut, weil ich trade. Ich habe Test-Frameworks gebaut, weil ich teste. Überzeugung kommt durch, wenn du für dich selbst baust.

4. **Optimiere nicht, bevor du Nutzer hast.** Liefere die hässliche Version aus. Hol Feedback. Dann poliere.

5. **Dein Portfolio IST das Projekt.** Das Meta-Projekt, eine Portfolio-Seite mit SLOs, Incident-Drills und Nachweisartefakten zu betreiben, ist selbst ein Beweis für Engineering-Reife.

## Ein Jahr später

Ich habe in einem Jahr solo mehr gebaut als viele Teams in zwei Jahren. Nicht weil ich schneller bin – sondern weil ich keine Meetings, kein Planning Poker, keine Sprint-Zeremonien und keinen organisatorischen Overhead habe.

Der Preis ist Einsamkeit, Selbstzweifel und die ständige Frage: "Ist das gut genug?" Die Antwort ist immer: "Liefere es aus und finde es heraus."
