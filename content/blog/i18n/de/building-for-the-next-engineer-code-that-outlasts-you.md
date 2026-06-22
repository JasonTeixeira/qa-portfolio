---
title: "Für den nächsten Entwickler bauen: Code, der dich überdauert"
excerpt: "Jedes System, das ich gebaut habe, ist darauf ausgelegt, ohne mich zu laufen. Das ist kein Zufall – es ist bewusstes Design für Betriebsfähigkeit. So mache ich es anders."
sourceSlug: building-for-the-next-engineer-code-that-outlasts-you
locale: de
sourceHash: 814f38f38d92909f
machineTranslated: true
---

# Für den nächsten Entwickler bauen: Code, der dich überdauert

Der beste Test deiner Arbeit ist, was passiert, wenn du gehst. Wenn jemand dich anschreiben muss: „Wie funktioniert das?“ – hast du versagt. Systeme sollen weiterlaufen. Pipelines sollen weiter deployen. Dashboards sollen sich weiter aktualisieren.

Das ist der bewussteste Teil meiner Ingenieurspraxis: für die Person zu bauen, die nach mir kommt.

## Der Test

Bevor ich ein System als „fertig“ betrachte, frage ich: **„Könnte ein mittlerer Entwickler, der diesen Code noch nie gesehen hat, ihn betreiben, ohne mich zu kontaktieren?“**

Wenn die Antwort nein ist, bin ich nicht fertig. Der Code mag funktionieren, aber er ist nicht vollständig.

## Wie „Betriebsfähigkeit“ aussieht

### 1. README, das die ersten 5 Fragen beantwortet

Jeder neue Entwickler stellt dieselben 5 Fragen:
1. Was macht das?
2. Wie führe ich es lokal aus?
3. Wie deploye ich es?
4. Wo sind die Logs?
5. Wen kontaktiere ich, wenn es kaputtgeht?

\\\
