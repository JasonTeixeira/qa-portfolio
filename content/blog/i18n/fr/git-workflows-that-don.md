---
title: "Flux de travail Git qui ne donnent pas envie de tout plaquer"
excerpt: "Trunk-based vs GitFlow vs GitHub Flow — j'ai utilisé les trois. Voici ce qui fonctionne vraiment pour les développeurs solo et les petites équipes, et pourquoi la plupart des workflows Git sont trop complexes."
sourceSlug: git-workflows-that-don
locale: fr
sourceHash: c676d6ff79c74263
machineTranslated: true
---

# Les Workflows Git Qui Ne Donnent Pas Envie de Tout Lâcher

J'ai travaillé avec GitFlow sur des projets plus importants. Branches de fonctionnalités, branches de développement, branches de release, branches de hotfix. Le graphe des branches ressemblait à un plan de métro. Fusionner une fonctionnalité nécessitait un doctorat en résolution de conflits.

Maintenant j'utilise le trunk-based development. Une seule branche. Livrer depuis main. Ma fréquence de déploiement est passée d'hebdomadaire à quotidienne.

## Pourquoi la Plupart des Workflows Git Sont Trop Complexes

GitFlow a été conçu pour des logiciels livrés trimestriellement sur support physique. Si votre processus de déploiement implique de graver un CD, vous avez besoin de branches de release.

Si vous déployez en fusionnant vers main et que Vercel/GitHub Actions gère le reste, vous n'avez pas besoin de 90% de GitFlow.

## Ce Que Je Fais Concrètement

\\\
