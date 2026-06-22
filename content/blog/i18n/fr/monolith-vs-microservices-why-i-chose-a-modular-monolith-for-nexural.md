---
title: "Monolith vs Microservices : pourquoi j'ai choisi un monolithe modulaire pour Nexural"
excerpt: "La plateforme Nexural compte 7 systèmes mais fonctionne comme un monolithe modulaire, pas comme des microservices. Voici pourquoi c'était le bon choix pour un ingénieur solo, et quand je diviserais."
sourceSlug: monolith-vs-microservices-why-i-chose-a-modular-monolith-for-nexural
locale: fr
sourceHash: bbc8c35698d66e27
machineTranslated: true
---

# Monolithe vs Microservices : Pourquoi j’ai choisi un monolithe modulaire pour Nexural

L’écosystème Nexural comprend 7 systèmes interconnectés : tableau de bord de trading, bot Discord, moteur de recherche, système d’alertes, studio de newsletter, suivi de stratégie et suite d’automatisation.

On pourrait naturellement penser qu’il s’agit d’une architecture en microservices. Ce n’est pas le cas. C’est un monolithe modulaire — et ce choix était délibéré.

## Le cadre de décision

Je me suis posé trois questions :

1. **Combien d’ingénieurs ?** Un (moi). Les microservices multiplient la charge opérationnelle. Avec un seul ingénieur, chaque nouveau service signifie un pipeline de déploiement supplémentaire, une configuration de monitoring de plus, un mode de défaillance à déboguer à 2h du matin.

2. **Les modules ont-ils besoin d’une mise à l’échelle indépendante ?** Pas encore. Le tableau de bord de trading et le moteur de recherche tournent tous deux sur Vercel. Ils n’ont pas de profils de mise à l’échelle différents qui justifieraient une infrastructure séparée.

3. **Les modules nécessitent-ils des piles technologiques différentes ?** Partiellement — le bot Discord est en Node.js, le système d’alertes est en .NET. Ce sont des services séparés par nécessité. Mais les applications web sont toutes en Next.js/TypeScript et partagent les types, les utilitaires et l’accès à la base de données.

## Ce que « Monolithe modulaire » signifie concrètement

La base de code est organisée en un seul dépôt avec des limites de domaine claires :
