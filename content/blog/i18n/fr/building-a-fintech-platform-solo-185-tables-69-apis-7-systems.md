---
title: "Créer une plateforme Fintech en solo : 185 tables, 69 API, 7 systèmes"
excerpt: "L'histoire complète de l'architecture et de la construction de l'écosystème Nexural de zéro — conception de base de données, architecture API, intégration Stripe, et leçons d'être le seul ingénieur sur une plateforme fintech en production."
sourceSlug: building-a-fintech-platform-solo-185-tables-69-apis-7-systems
locale: fr
sourceHash: 23f602ed84078e28
machineTranslated: true
---

# Construire une plateforme Fintech en solo : 185 tables, 69 API, 7 systèmes

La plupart des ingénieurs travaillent sur un seul service à la fois. Moi, j'ai construit un écosystème complet.

La plateforme Nexural a commencé comme une idée simple : un tableau de bord pour ma communauté de traders. Elle est devenue une plateforme fintech complète avec 185 tables de base de données, 69 endpoints API, la facturation Stripe, un bot Discord alimenté par IA, un moteur de recherche, un studio de newsletter et un système d'alerte en temps réel.

J'ai tout conçu et tout construit. Voici ce que j'ai appris.

Système connexe : [Build a product surface and system map](/blog/build-a-product-surface-and-system-map) transforme le même motif surface/système en un framework de construction reproductible.

## Le périmètre

Sept systèmes interconnectés :
1. **Tableau de bord de trading** — données de marché en temps réel, graphiques, suivi de portefeuille
2. **Moteur IA Discord** — 30+ commandes, intégration GPT-4o, modération automatique
3. **Moteur de recherche** — 71+ métriques, analyse de stratégie, import CSV
4. **Système d'alerte** — intégration NinjaTrader 8, backend .NET, notifications en temps réel
5. **Studio de newsletter** — génération et distribution automatisées de contenu
6. **Suivi de stratégie** — monitoring des performances sur les systèmes de trading
7. **Suite d'automatisation** — 61 suites de tests, CI/CD, portes de qualité

## Conception de base de données à grande échelle

185 tables, ça semble intimidant. La clé a été une conception par phases :

- **Phase 1 (Cœur) :** Utilisateurs, auth, abonnements — 20 tables
- **Phase 2 (Trading) :** Instruments, positions, signaux — 35 tables
- **Phase 3 (Communauté) :** Intégration Discord, logs de modération — 25 tables
- **Phase 4 (Analytique) :** Métriques, rapports, télémétrie — 30 tables
- **Phases 5-7 :** Recherche, alertes, newsletter — 75 tables

Chaque phase avait sa propre migration, sa propre suite de tests et son propre plan de rollback. Je n'ai jamais modifié plus d'un domaine à la fois.

### Décisions de schéma qui ont compté

**Normalisé là où ça compte :** Utilisateur → Abonnement → Plan est entièrement normalisé. Pas de raccourcis de dénormalisation qui créeraient des bugs de facturation.

**Dénormalisé là où la vitesse compte :** Les tableaux de bord de trading interrogent des vues dénormalisées. Un trader se moque de la 3NF — ce qui compte pour lui, ce sont des temps de chargement inférieurs à 50 ms.

**Sécurité au niveau des lignes partout :** Politiques RLS Supabase sur chaque table. Un utilisateur ne peut jamais voir les données d'un autre utilisateur, même si l'API a un bug.

## Architecture API

69 endpoints suivant des motifs cohérents :

\
