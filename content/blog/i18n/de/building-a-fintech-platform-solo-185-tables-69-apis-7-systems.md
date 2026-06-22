---
title: "Aufbau einer Fintech-Plattform im Alleingang: 185 Tabellen, 69 APIs, 7 Systeme"
excerpt: "Die vollständige Geschichte der Architektur und Entwicklung des Nexural-Ökosystems von Grund auf – Datenbankdesign, API-Architektur, Stripe-Integration und Lehren aus der Arbeit als einziger Ingenieur an einer produktiven Fintech-Plattform."
sourceSlug: building-a-fintech-platform-solo-185-tables-69-apis-7-systems
locale: de
machineTranslated: true
---

# Solo eine Fintech-Plattform bauen: 185 Tabellen, 69 APIs, 7 Systeme

Die meisten Entwickler arbeiten an einem Dienst nach dem anderen. Ich habe ein ganzes Ökosystem gebaut.

Die Nexural-Plattform begann als einfache Idee: ein Dashboard für meine Trading-Community. Daraus wurde eine vollständige Fintech-Plattform mit 185 Datenbanktabellen, 69 API-Endpunkten, Stripe-Abrechnung, einem KI-gestützten Discord-Bot, einer Research-Engine, einem Newsletter-Studio und einem Echtzeit-Benachrichtigungssystem.

Ich habe alles entworfen und gebaut. Hier ist, was ich gelernt habe.

Verwandtes System: [Build a product surface and system map](/blog/build-a-product-surface-and-system-map) verwandelt dasselbe Oberflächen-/Systemmuster in ein wiederholbares Builder-Framework.

## Der Umfang

Sieben miteinander verbundene Systeme:
1. **Trading Dashboard** — Echtzeit-Marktdaten, Charts, Portfolio-Tracking
2. **Discord AI Engine** — 30+ Befehle, GPT-4o-Integration, Auto-Moderation
3. **Research Engine** — 71+ Metriken, Strategieanalyse, CSV-Import
4. **Alert System** — NinjaTrader 8-Integration, .NET-Backend, Echtzeit-Benachrichtigungen
5. **Newsletter Studio** — automatisierte Inhaltserstellung und -verteilung
6. **Strategy Tracker** — Performance-Überwachung über Handelssysteme hinweg
7. **Automation Suite** — 61 Testsuiten, CI/CD, Qualitäts-Gates

## Datenbankdesign in großem Maßstab

185 Tabellen klingen einschüchternd. Der Schlüssel war ein phasenweises Design:

- **Phase 1 (Kern):** Benutzer, Authentifizierung, Abonnements — 20 Tabellen
- **Phase 2 (Trading):** Instrumente, Positionen, Signale — 35 Tabellen
- **Phase 3 (Community):** Discord-Integration, Moderationslogs — 25 Tabellen
- **Phase 4 (Analytik):** Metriken, Berichte, Telemetrie — 30 Tabellen
- **Phase 5-7:** Research, Benachrichtigungen, Newsletter — 75 Tabellen

Jede Phase hatte ihre eigene Migration, ihre eigene Testsuite und ihren eigenen Rollback-Plan. Ich habe nie mehr als eine Domäne gleichzeitig modifiziert.

### Schema-Entscheidungen, die zählten

**Normalisiert, wo es zählt:** Benutzer → Abonnement → Tarif ist vollständig normalisiert. Keine Denormalisierungs-Abkürzungen, die Abrechnungsfehler verursachen würden.

**Denormalisiert, wo Geschwindigkeit zählt:** Trading-Dashboards fragen denormalisierte Views ab. Ein Trader interessiert sich nicht für 3NF — er interessiert sich für Ladezeiten unter 50ms.

**Zeilenbasierte Sicherheit überall:** Supabase RLS-Richtlinien auf jeder Tabelle. Ein Benutzer kann niemals die Daten eines anderen Benutzers sehen, selbst wenn die API einen Fehler hat.

## API-Architektur

69 Endpunkte, die konsistenten Mustern folgen:
