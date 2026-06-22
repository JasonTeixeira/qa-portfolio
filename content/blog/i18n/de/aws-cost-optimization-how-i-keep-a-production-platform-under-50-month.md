---
title: "AWS-Kostenoptimierung: So halte ich eine Produktionsplattform unter 50 $/Monat"
excerpt: "Die Nexural-Plattform läuft auf AWS mit Vercel, Supabase und gezielten AWS-Diensten. So halte ich die Kosten für eine Plattform mit 185 Tabellen und Echtzeitdaten unter 50 $/Monat."
sourceSlug: aws-cost-optimization-how-i-keep-a-production-platform-under-50-month
locale: de
machineTranslated: true
---

# AWS Kostenoptimierung: Wie ich eine Produktionsplattform unter 50 $/Monat betreibe

Das Nexural-Ökosystem umfasst 185 Datenbanktabellen, 69 API-Endpunkte, Echtzeit-Marktdaten, KI-gestützte Funktionen und ein Live-Qualitätsdashboard. Meine AWS-Rechnung liegt unter 50 $/Monat.

So funktioniert's.

## Die Architektur, die Geld spart

**Prinzip: Verwaltete Dienste in ihren kostenlosen/günstigen Stufen nutzen, anstatt eigene Infrastruktur zu betreiben.**

| Dienst | Funktion | Monatliche Kosten |
|---------|----------|------------------|
| Vercel (Hobby → Pro) | Next.js-Hosting, Edge Functions | $0-20 |
| Supabase (Free → Pro) | PostgreSQL, Auth, Echtzeit | $0-25 |
| AWS S3 | Telemetriedaten, Artefakte | $0,02 |
| AWS Lambda | API-Proxy, Telemetrie-Aufnahme | $0 (Free Tier) |
| AWS API Gateway | Lambda-HTTP-Endpunkt | $0 (Free Tier) |
| AWS CloudFront | CDN + WAF | $0 (Free Tier) |
| GitHub Actions | CI/CD, geplante Jobs | $0 (kostenlos für öffentliche Repos) |

**Gesamt: ~$25-45/Monat** für eine Produktionsplattform.

## Die Tricks

### 1. Supabase statt RDS

Eine Supabase Pro-Instanz kostet 25 $/Monat und beinhaltet:
- PostgreSQL 15 mit 8 GB Speicher
- Row-Level Security
- Echtzeit-Abonnements
- Integrierte Authentifizierung
- Automatische Backups

Eine vergleichbare RDS-Instanz (db.t3.micro) kostet 15 $/Monat, aber Sie müssen Backups, Authentifizierung und Echtzeit-Funktionen selbst verwalten. Mit diesen Diensten liegen Sie bei 60 $+.

### 2. Lambda für stoßweise Workloads

Die Telemetrie-Aufnahme-API verarbeitet die meiste Zeit 0 Anfragen und bricht dann während CI-Läufen aus. Lambda ist perfekt: 0 $ im Leerlauf, Centbeträge bei Lastspitzen.
