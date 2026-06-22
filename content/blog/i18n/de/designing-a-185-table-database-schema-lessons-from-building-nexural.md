---
title: "Entwicklung eines Datenbankschemas mit 185 Tabellen: Erfahrungen aus dem Bau von Nexural"
excerpt: "Wie ich ein normalisiertes Datenbankschema für eine Fintech-Plattform mit 7 vernetzten Systemen entworfen habe. Schema-Phasen, RLS-Richtlinien, Denormalisierungs-Kompromisse und Migrationsstrategien."
sourceSlug: designing-a-185-table-database-schema-lessons-from-building-nexural
locale: de
sourceHash: 35047aee80b62eef
machineTranslated: true
---

# Entwurf eines Datenbankschemas mit 185 Tabellen: Erkenntnisse aus dem Bau von Nexural

Wenn Leute "185 Datenbanktabellen" hören, nehmen sie Komplexität um der Komplexität willen an. Aber jede Tabelle existiert, weil eine Geschäftsanforderung sie erforderte.

Hier ist, wie ich das Nexural-Schema entworfen habe – die Entscheidungen, die funktionierten, die, die ich ändern würde, und die Muster, die skalieren.

:::system-diagram title="Nexural-Schema-Wachstum" label="schema -> systems" nodes="Auth,Billing,Trading,Ops"
Die Datenbank begann nicht als riesiges Schema. Sie wuchs, als Produktdomänen real wurden: Benutzer, Abonnements, Handelsworkflows, Community-Funktionen, Analysen, Forschung und Betrieb.
:::

## Phasenbasierter Schemaentwurf

Ich habe nicht 185 Tabellen am ersten Tag entworfen. Das Schema wuchs über 7 Phasen, jede fügte eine Domäne hinzu:

:::scorecard title="Schema-Erstellungsphasen" label="scorecard"
Phase | Domäne | Tabellen | Schlüsselentscheidung
1 | Auth & Benutzer | 12 | Supabase Auth + benutzerdefinierte Profile
2 | Abonnements | 8 | Stripe-Webhook-gesteuerter Zustandsautomat
3 | Handel | 35 | Instrumente, Positionen, Signale, Watchlists
4 | Community | 25 | Discord-Synchronisation, Moderationsprotokolle, Reputation
5 | Analysen | 30 | Metriken, Berichte, Telemetrieereignisse
6 | Forschung | 40 | Strategien, Indikatoren, Backtest-Ergebnisse
7 | Betrieb | 35 | Alarme, Newsletter, Prüfprotokolle
:::

| Phase | Domäne | Tabellen | Schlüsselentscheidung |
|-------|--------|----------|----------------------|
| 1 | Auth & Benutzer | 12 | Supabase Auth + benutzerdefinierte Profile |
| 2 | Abonnements | 8 | Stripe-Webhook-gesteuerter Zustandsautomat |
| 3 | Handel | 35 | Instrumente, Positionen, Signale, Watchlists |
| 4 | Community | 25 | Discord-Synchronisation, Moderationsprotokolle, Reputation |
| 5 | Analysen | 30 | Metriken, Berichte, Telemetrieereignisse |
| 6 | Forschung | 40 | Strategien, Indikatoren, Backtest-Ergebnisse |
| 7 | Betrieb | 35 | Alarme, Newsletter, Prüfprotokolle |

Jede Phase hatte ihr eigenes Migrationspaket. Ich habe während der Entwicklung einer neuen Phase niemals Tabellen aus einer vorherigen Phase modifiziert. Das hielt die Bereitstellungen sicher.

## Die drei Regeln, die ich befolgte

### Regel 1: Alles normalisieren, außer heißen Pfaden

Die kanonischen Daten sind immer normalisiert. \
