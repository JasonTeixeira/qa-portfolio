---
title: "Conception d'un schéma de base de données de 185 tables : leçons tirées de la construction de Nexural"
excerpt: "Comment j'ai conçu un schéma de base de données normalisé pour une plateforme fintech avec 7 systèmes interconnectés. Phases de schéma, politiques RLS, compromis de dénormalisation et stratégies de migration."
sourceSlug: designing-a-185-table-database-schema-lessons-from-building-nexural
locale: fr
sourceHash: 35047aee80b62eef
machineTranslated: true
---

# Concevoir un schéma de base de données de 185 tables : Leçons tirées de la création de Nexural

Quand les gens entendent « 185 tables de base de données », ils imaginent une complexité gratuite. Mais chaque table existe parce qu'un besoin métier l'exigeait.

Voici comment j'ai conçu le schéma Nexural — les décisions qui ont fonctionné, celles que je modifierais, et les modèles qui passent à l'échelle.

:::system-diagram title="Croissance du schéma Nexural" label="schéma -> systèmes" nodes="Auth,Facturation,Trading,Ops"
La base de données n'a pas commencé comme un schéma géant. Elle a grandi au fur et à mesure que les domaines produit devenaient réels : utilisateurs, abonnements, workflows de trading, fonctionnalités communautaires, analytics, recherche et opérations.
:::

## Conception du schéma par phases

Je n'ai pas conçu 185 tables le premier jour. Le schéma a grandi en 7 phases, chacune ajoutant un domaine :

:::scorecard title="Phases de construction du schéma" label="scorecard"
Phase | Domaine | Tables | Décision clé
1 | Auth & Utilisateurs | 12 | Supabase Auth + profils personnalisés
2 | Abonnements | 8 | Machine d'état pilotée par webhook Stripe
3 | Trading | 35 | Instruments, positions, signaux, listes de suivi
4 | Communauté | 25 | Synchronisation Discord, logs de modération, réputation
5 | Analytics | 30 | Métriques, rapports, événements de télémétrie
6 | Recherche | 40 | Stratégies, indicateurs, résultats de backtest
7 | Opérations | 35 | Alertes, newsletters, journaux d'audit
:::

| Phase | Domaine | Tables | Décision clé |
|-------|---------|--------|-------------|
| 1 | Auth & Utilisateurs | 12 | Supabase Auth + profils personnalisés |
| 2 | Abonnements | 8 | Machine d'état pilotée par webhook Stripe |
| 3 | Trading | 35 | Instruments, positions, signaux, listes de suivi |
| 4 | Communauté | 25 | Synchronisation Discord, logs de modération, réputation |
| 5 | Analytics | 30 | Métriques, rapports, événements de télémétrie |
| 6 | Recherche | 40 | Stratégies, indicateurs, résultats de backtest |
| 7 | Opérations | 35 | Alertes, newsletters, journaux d'audit |

Chaque phase avait son propre lot de migrations. Je n'ai jamais modifié les tables d'une phase précédente pendant le développement d'une nouvelle phase. Cela a permis de sécuriser les déploiements.

## Les trois règles que j'ai suivies

### Règle 1 : Normaliser tout sauf les chemins chauds

Les données canoniques sont toujours normalisées. \
