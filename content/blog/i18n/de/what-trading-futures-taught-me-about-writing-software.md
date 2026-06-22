---
title: "Was mir der Futures-Handel über das Schreiben von Software beigebracht hat"
excerpt: "Ich handle jeden Morgen ES-, NQ- und CL-Futures, bevor ich Code schreibe. Die Parallelen zwischen Risikomanagement im Handel und Risikomanagement in der Software sind unangenehm ähnlich."
sourceSlug: what-trading-futures-taught-me-about-writing-software
locale: de
sourceHash: d440df8c786a8375
machineTranslated: true
---

# Was mir der Futures-Handel über das Schreiben von Software beigebracht hat

Jeden Morgen um 6 Uhr, bevor ich auch nur eine Zeile Code schreibe, starre ich auf Futures-Charts. ES (S&P 500), NQ (Nasdaq), CL (Rohöl), GC (Gold) — 8 Symbole auf NinjaTrader, auf der Suche nach Setups.

Ich handle seit Jahren. Und je mehr ich beides mache — handeln und Software entwickeln — desto mehr wird mir klar, dass es dieselbe Disziplin ist, nur in anderer Verkleidung.

## Lektion 1: Risikomanagement > Recht haben

Beim Trading kann man in 60 % der Fälle falsch liegen und trotzdem Geld verdienen. Klingt unmöglich, aber die Mathematik ist einfach: Wenn deine Gewinner doppelt so groß sind wie deine Verlierer, musst du nur in 34 % der Fälle richtig liegen, um die Gewinnschwelle zu erreichen.

Dasselbe gilt für Software. Nicht jede Architekturentscheidung muss perfekt sein. Du brauchst, dass die Fehlschläge klein sind und die Erfolge sich summieren.

Deshalb mache ich Folgendes:
- Kleine Änderungen ausrollen (kleine Verlusttrades)
- Riskante Änderungen hinter Feature-Flags verstecken (Stop-Losses)
- Rollback-Verfahren bereithalten (Ausstiegsstrategie)
- Niemals am Freitag ausrollen (niemals übers Wochenende halten)

Ein Trader, der sein gesamtes Konto auf einen Trade setzt, wird explodieren. Ein Entwickler, der eine riesige, ungetestete Änderung in die Produktion ausrollt, wird explodieren. Dieselbe Energie.

## Lektion 2: Das Setup zählt mehr als der Einstieg

Neue Trader besessen vom Einstiegszeitpunkt. "Soll ich bei 4.521,25 oder 4.521,50 kaufen?" Das spielt keine Rolle. Worauf es ankommt, ist das Setup: Ist der Trend auf deiner Seite? Gibt es einen klaren Ungültigkeitspunkt? Ist das Risiko-Ertrags-Verhältnis mindestens 2:1?

Neue Entwickler besessen von der Technologiewahl. "Soll ich Prisma oder Drizzle verwenden?" Das spielt keine Rolle. Worauf es ankommt, ist die Architektur: Ist dein Datenmodell solide? Sind deine APIs gut designt? Kannst du später deine Meinung ändern, ohne alles neu schreiben zu müssen?

Das spezifische Tool ist der Einstieg. Die Architektur ist das Setup. Wenn das Setup sitzt, wird die Tool-Wahl zum Rundungsfehler.

## Lektion 3: Alles protokollieren

Ich führe ein Trading-Journal. Jeder Trade: Einstieg, Ausstieg, Begründung, Emotionen, Marktkontext, Ergebnis, Lehren. Nach 6 Monaten zeigen sich Muster. Ich trade montags zu viel. Ich halte Verlierer zu lange, wenn ich müde bin. Ich gehe nach einer Gewinnserie zu aggressiv rein.

Ich führe jetzt das Engineering-Äquivalent: Architecture Decision Records (ADRs). Jede größere Entscheidung: was ich gewählt habe, was ich verworfen habe, warum, was ich ändern würde. Nach einem Jahr Nexural-Entwicklung sind die Muster klar. Ich investiere zu wenig in die Fehlerbehandlung am Anfang. Ich über-engineere die Authentifizierung. Ich unterschätze durchgängig die Komplexität von Datenbank-Migrationen.

Selbsterkenntnis durch Dokumentation. Dieselbe Praxis, andere Domäne.

## Lektion 4: Überlebende sind langweilig

Die erfolgreichsten Trader, die ich kenne, sind langweilig. Sie handeln dieselben 2-3 Setups, Tag für Tag, mit denselben Risikoparametern. Keine YOLO-Spiele. Kein "Ich habe heute ein gutes Gefühl." Nur konsequente Umsetzung einer bewährten Strategie.

Die besten Codebasen, in denen ich gearbeitet habe, sind auch langweilig. Konsistente Muster. Vorhersagbare Dateistrukturen. Standard-Namenskonventionen. Keine cleveren Hacks. Kein "Ich habe einen coolen Weg gefunden, das zu machen." Nur zuverlässiger, wartbarer Code, der tut, was er verspricht.

Langweilig wird in beiden Disziplinen unterschätzt.

## Lektion 5: Du handelst gegen dich selbst

Märkte interessieren sich nicht für dich. Sie sind nicht hinter dir her. Jeder Verlust ist eine Konsequenz deiner Entscheidungen, nicht der Bosheit des Marktes.

Software interessiert sich auch nicht für dich. Bugs sind nichts Persönliches. Produktionsausfälle sind nicht die Strafe des Universums. Sie sind Konsequenzen von Entscheidungen — meistens vor Wochen unter anderen Rahmenbedingungen getroffen.

Verantwortung zu übernehmen (im Trading nennt man das "für seinen P&L verantwortlich sein") ist das, was Profis von Amateuren in beiden Bereichen unterscheidet.

## Die Meta-Lektion

Sowohl Trading als auch Softwareentwicklung sind Disziplinen des Umgangs mit Komplexität unter Unsicherheit. Beim Trading ist die Unsicherheit die Marktrichtung. Bei Software ist die Unsicherheit das Nutzerverhalten, die Systemlast und die Randfälle.

Die Werkzeuge sind unterschiedlich. Die Prinzipien sind identisch:
- Risiko zuerst managen, dann nach Ertrag suchen
- Einen Plan haben, bevor man ausführt
- Dokumentieren, was passiert ist, und daraus lernen
- Konsistent sein, nicht clever
- Lange genug überleben, um seinen Vorteil zu multiplizieren

Ich entwickle bessere Software, weil ich trade. Und ich trade besser, weil ich Software entwickle. Die gegenseitige Befruchtung ist real.
