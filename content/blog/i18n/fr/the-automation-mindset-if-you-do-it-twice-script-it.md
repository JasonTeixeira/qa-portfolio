---
title: "L'état d'esprit de l'automatisation : si vous le faites deux fois, scriptez-le"
excerpt: "J'ai 47 scripts shell, 6 workflows CI et une tâche cron qui m'envoie un SMS quand mon certificat SSL expire. Voici l'état d'esprit derrière l'automatisation de tout."
sourceSlug: the-automation-mindset-if-you-do-it-twice-script-it
locale: fr
machineTranslated: true
---

# L'état d'esprit d'automatisation : si tu le fais deux fois, scripte-le

Mardi dernier, j'ai exécuté une migration de base de données, testé 3 endpoints API, vérifié les logs du webhook Stripe, confirmé que le pipeline CI était au vert, et déployé en production. Temps total : 4 minutes.

Avant, ça me prenait 45 minutes.

La différence n'est pas que je suis devenu plus rapide à cliquer sur des boutons. C'est que j'ai complètement arrêté de cliquer sur des boutons.

## La règle

**Si je fais quelque chose manuellement deux fois, je l'automatise la troisième fois.**

Pas « quand j'aurai le temps ». Pas « au prochain sprint ». La troisième fois. Parce que la quatrième fois arrive, et la cinquième, et la centième.

## Ma stack d'automatisation

### Script de déploiement (a remplacé 12 étapes manuelles)

\\\
