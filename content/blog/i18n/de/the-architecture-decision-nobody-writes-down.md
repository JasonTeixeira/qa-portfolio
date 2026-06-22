---
title: "Die Architekturentscheidung, die niemand aufschreibt"
excerpt: "Wir verbringen Wochen mit der Wahl zwischen Kafka und RabbitMQ, dokumentieren aber nie das Warum. ADRs dauern 15 Minuten und sparen monatelange ‚Warum haben wir das gemacht?‘-Gespräche."
sourceSlug: the-architecture-decision-nobody-writes-down
locale: de
machineTranslated: true
---

# Die Architekturentscheidung, die niemand aufschreibt

Vor sechs Monaten habe ich mich bei Nexural für Supabase statt Firebase entschieden. Ich hatte gute Gründe – PostgreSQL, Row-Level Security, selbst hostbar. Aber ich hätte diese Gründe fast vergessen. Das Einzige, was mich davor bewahrt hat, dieselbe Entscheidung erneut zu bewerten (und eine Woche zu verschwenden), war eine Markdown-Datei, die ich in 15 Minuten geschrieben habe.

## Das Problem

Jedes Engineering-Team kennt diese Unterhaltung:

"Warum verwenden wir RabbitMQ statt Kafka?"
"Ich glaube, Dave hat das entschieden. Dave ist vor 8 Monaten gegangen."
"..."
"Sollten wir zu Kafka wechseln?"

Und schon verbringst du einen Sprint damit, eine Entscheidung neu zu bewerten, die bereits bewertet wurde. Das institutionelle Wissen ist zur Tür hinausgegangen.

## Architecture Decision Records (ADRs)

Ein ADR ist ein kurzes Dokument, das eine bedeutende Entscheidung festhält. Meine sind denkbar einfach:

\\\
