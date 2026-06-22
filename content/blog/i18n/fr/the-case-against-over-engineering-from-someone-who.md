---
title: "Le cas contre la sur-ingénierie (de la part de quelqu'un qui l'a fait)"
excerpt: "J'ai un jour construit une architecture de plugins pour un système qui n'en avait jamais besoin. 3 semaines de couches d'abstraction pour une fonctionnalité que personne n'avait demandée. Voici comment j'ai appris à m'arrêter."
sourceSlug: the-case-against-over-engineering-from-someone-who
locale: fr
sourceHash: bc02bbe3cb578fd8
machineTranslated: true
---

# Le cas contre la sur-ingénierie (par quelqu'un qui l'a pratiquée)

J'ai un aveu à faire. En 2023, j'ai passé trois semaines à construire un système de plugins pour un framework d'automatisation de tests. Des exécuteurs de tests configurables. Des plugins à rechargement à chaud. Un conteneur d'injection de dépendances. Tout le tralala.

Personne n'a jamais écrit un seul plugin.

Le framework tournait en CI avec la même configuration à chaque fois. L'« extensibilité » que j'avais construite n'a été utilisée par exactement zéro personne. J'aurais pu livrer l'ensemble en 4 jours sans l'architecture de plugins.

## Comment la sur-ingénierie se produit

Tout commence par une pensée raisonnable : « Et si on devait étendre ça plus tard ? »

Cette pensée est le piège. Parce que « plus tard » ressemble rarement à ce que vous imaginiez, et les abstractions que vous construisez pour des besoins imaginaires gênent généralement les besoins réels.

Voici la progression que j'ai observée chez moi :

1. Construire une fonction simple ✅
2. Penser « ça devrait être configurable » ⚠️
3. Ajouter un objet de configuration
4. Penser « différents environnements pourraient nécessiter différentes implémentations » ⚠️
5. Ajouter une interface et un pattern factory
6. Penser « on pourrait avoir besoin d'échanger ça à l'exécution » 🚩
7. Ajouter l'injection de dépendances
8. Réaliser que personne n'a jamais eu besoin de l'échanger
9. Maintenir l'abstraction pour toujours parce que la supprimer est plus difficile que la garder

## Les trois questions

Avant d'ajouter une abstraction, je me pose désormais ces questions :

**1. « Est-ce que quelqu'un a réellement demandé ça ? »**

Si la réponse est « non, mais ils pourraient » — ne le construisez pas. YAGNI (You Aren't Gonna Need It) est le principe le plus violé en ingénierie.

**2. « Quel est le coût d'ajouter ça plus tard par rapport à maintenant ? »**

Si je peux ajouter l'abstraction en 2 heures quand elle sera réellement nécessaire, il n'y a aucune raison de la construire maintenant « au cas où ». Le coût d'une abstraction prématurée (maintenir du code que personne n'utilise) est presque toujours plus élevé que le coût de l'ajouter plus tard.

**3. « Puis-je expliquer pourquoi ça existe en une phrase à quelqu'un ? »**

« Nous utilisons l'injection de dépendances parce que nous devons échanger le fournisseur de paiement entre Stripe et Braintree dans différents environnements. » C'est une vraie raison.

« Nous utilisons l'injection de dépendances parce que c'est une bonne pratique. » Ce n'est pas une raison. C'est du cargo cult.

## À quoi ressemble un code simple

\\\
