---
title: "Monitoring, das wirklich etwas aussagt"
excerpt: "Dashboards mit 47 Panels, auf denen alles grün ist, sind kein Monitoring. Sie sind Dekoration. Hier ist, was ich tatsächlich überwache und warum die meisten Alarmierungen nutzloses Rauschen sind."
sourceSlug: monitoring-that-actually-tells-you-something
locale: de
sourceHash: 4c2fd7867d8e623f
machineTranslated: true
---

# Monitoring, das dir wirklich etwas sagt

Ich habe einmal eine Grafana-Instanz mit 47 Dashboard-Panels geerbt. CPU-Auslastung, Speichernutzung, Disk-I/O, Netzwerk-Bytes, JVM-Heap – jede erdenkliche Metrik. Alles war grün. Die ganze Zeit.

Zwei Tage später war die API für 4 Stunden ausgefallen. Kein einziger Alarm wurde ausgelöst.

Warum? Weil die CPU bei 22 %, der Speicher bei 45 % und die Festplatte bei 30 % lag. Alles „gesund". Das eigentliche Problem war eine Erschöpfung des Verbindungspools – eine Metrik, die niemand überwachte.

## Die vier goldenen Signale (und sonst nichts)

Google's SRE-Buch hat den Nagel auf den Kopf getroffen. Du brauchst genau vier Signale:

**1. Latenz** – Wie lange dauern Anfragen?
Nicht die durchschnittliche Latenz – die versteckt Probleme. Verfolge P50, P95 und P99:

- P50 = 200ms bedeutet, die Hälfte deiner Nutzer erhält Antworten in 200ms (gut)
- P95 = 800ms bedeutet, 1 von 20 Nutzern wartet 800ms (akzeptabel)
- P99 = 5000ms bedeutet, 1 von 100 Nutzern wartet 5 Sekunden (Problem)

Dein P99 ist deine tatsächliche Leistung. Der Durchschnitt lügt.

**2. Traffic** – Wie viele Anfragen bearbeitest du?
Das ist deine Baseline. Wenn der Traffic an einem Dienstag um 14 Uhr um 80 % einbricht, stimmt etwas nicht, selbst wenn alle anderen Metriken grün sind.

**3. Fehler** – Wie viel Prozent der Anfragen schlagen fehl?
Verfolge die Fehlerrate, nicht die Fehleranzahl. 100 Fehler bei 1 Million Anfragen (0,01 %) ist in Ordnung. 100 Fehler bei 200 Anfragen (50 %) ist ein Ausfall.

**4. Sättigung** – Wie voll ist dein System?
Datenbankverbindungen, Speicher, Warteschlangentiefe, Thread-Pools. Wenn eine Ressource 80 % Auslastung erreicht, musst du handeln – nicht weil sie kaputt ist, sondern weil du deinen Spielraum verloren hast.

## Mein tatsächliches Monitoring-Setup

Für die Nexural-Plattform:

\\\
