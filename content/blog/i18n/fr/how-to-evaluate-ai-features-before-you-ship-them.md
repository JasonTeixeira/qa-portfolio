---
title: "Comment évaluer les fonctionnalités IA avant de les déployer"
excerpt: "Un cycle d'évaluation pratique pour les fonctionnalités IA : définir la promesse, constituer un ensemble d'échecs, tester les cas banals et garder un humain dans la boucle jusqu'à ce que le système gagne la confiance."
sourceSlug: how-to-evaluate-ai-features-before-you-ship-them
locale: fr
machineTranslated: true
---

# Comment évaluer les fonctionnalités IA avant de les déployer

Une fonctionnalité IA n'est pas terminée quand elle fonctionne dans la démo.

C'est le piège. Vous posez trois questions amicales, elle en répond deux et demie, tout le monde entrevoit la forme du futur, et soudain la feuille de route produit contient une fonctionnalité appelée « assistant IA » là où un cahier des charges devrait se trouver.

Je ne fais pas confiance à cette version du processus. Je fais confiance à la version plus lente : nommer la promesse, écrire les cas d'échec, tester le chemin ennuyeux, et garder un humain à proximité jusqu'à ce que le système prouve qu'il peut se comporter correctement.

:::system-diagram title="Boucle d'évaluation IA" label="promesse -> preuve" nodes="Promesse,Échecs,Révision,Déploiement"
La fonctionnalité n'est pas évaluée une seule fois. Elle parcourt une boucle : définir la promesse, construire l'ensemble des échecs, réviser les sorties réelles, et seulement alors décider ce qui peut être déployé.
:::

## Commencer par la promesse

La première question n'est pas « Quel modèle devrions-nous utiliser ? »

La première question est : qu'est-ce que l'utilisateur est autorisé à croire après que cette fonctionnalité a répondu ?

Cette phrase compte. Si la fonctionnalité résume un document, l'utilisateur croit que le résumé est fidèle. Si elle rédige une réponse de support, l'utilisateur croit qu'elle n'inventera pas une politique de remboursement. Si elle explique un signal de trading, l'utilisateur croit qu'il ne s'agit pas d'un conseil financier déguisé en ton amical.

Écrivez la promesse en une ligne :

- « Cette fonctionnalité classifie la requête et l'achemine vers le bon workflow. »
- « Cette fonctionnalité rédige une réponse qu'un humain approuve avant l'envoi. »
- « Cette fonctionnalité recherche dans les documents internes et cite la source utilisée. »

Si la promesse prend un paragraphe, la fonctionnalité n'est pas encore cadrée.

## Construire l'ensemble des échecs avant le chemin heureux

La plupart des démos IA sont accidentellement entraînées à réussir la démo.

Le véritable ensemble d'évaluation devrait inclure les entrées qui rendent le produit inconfortable :

- requêtes vagues
- instructions contradictoires
- contexte manquant
- injection de prompt malveillante
- anciens documents de politique
- enregistrements en double
- messages clients contenant de la colère
- cas limites qui coûtent de l'argent s'ils sont mal gérés

Pour un workflow IA orienté client, je veux au moins 25 exemples avant de faire confiance à la forme du système. Pas 25 lignes de benchmark parfaites. Vingt-cinq exemples laids qui représentent le travail réel.

L'ensemble d'évaluation n'est pas de la paperasse. C'est la frontière du produit.

## Séparer la qualité du modèle de la qualité du produit

Un modèle peut être bon et le produit peut être mauvais.

Le modèle peut produire une réponse correcte sans citation. Le workflow peut citer le bon document mais enterrer l'avertissement important. L'interface utilisateur peut donner l'impression que la réponse est définitive alors qu'elle n'est qu'un brouillon.

Je note les fonctionnalités IA par couches :

1. A-t-elle compris la tâche ?
2. A-t-elle utilisé la bonne source ou le bon outil ?
3. A-t-elle évité de faire des affirmations en dehors de la source ?
4. A-t-elle retourné le résultat sous une forme exploitable par l'utilisateur ?
5. L'interface utilisateur a-t-elle rendu clairs la confiance et les limites du système ?

Seules les deux premières sont principalement des questions de modèle. Le reste sont des questions de produit.

## Garder un humain dans la boucle plus longtemps que ce qui semble pratique

La première version en production d'un workflow IA devrait généralement être d'abord un brouillon, pas un envoi direct.

Cela semble moins magique. Tant mieux.

Le brouillon d'abord vous donne des données de révision. Il montre où les utilisateurs modifient la sortie, où ils la rejettent, quels champs ils corrigent, et quelles tâches n'auraient jamais dû être automatisées en premier lieu.

L'étape de révision humaine n'est pas une béquille permanente. C'est de l'instrumentation.

Quand les modifications deviennent prévisibles, automatisez la modification. Quand les rejets se concentrent autour d'un type d'entrée, changez le routeur. Quand le relecteur vérifie manuellement la même source à chaque fois, ajoutez la récupération et la citation.

Vous ne retirez pas l'humain parce que la démo a fonctionné. Vous retirez l'humain quand le journal de révision dit que le système l'a mérité.

## La liste de contrôle de déploiement

Avant de déployer une fonctionnalité IA, je veux que ces éléments soient en place :

:::checklist title="Liste de contrôle de déploiement d'une fonctionnalité IA" label="liste de contrôle"
- Une promesse en une phrase.
- Un ensemble d'évaluation avec des exemples laids.
- Des critères de réussite/échec pour chaque exemple.
- Une journalisation pour le prompt, les appels d'outils, les sources et le résultat.
- Un chemin de révision humaine pour les sorties à haut risque.
- Un repli lorsque le modèle est indisponible.
- Un moyen de signaler une mauvaise sortie depuis l'interface utilisateur.
:::

- une promesse en une phrase
- un ensemble d'évaluation avec des exemples laids
- des critères de réussite/échec pour chaque exemple
- une journalisation pour le prompt, les appels d'outils, les sources et le résultat
- un chemin de révision humaine pour les sorties à haut risque
- un repli lorsque le modèle est indisponible
- un moyen de signaler une mauvaise sortie depuis l'interface utilisateur

Rien de tout cela ne rend la fonctionnalité moins impressionnante.

Cela la rend réelle.

:::offer-cta title="Besoin d'évaluer une fonctionnalité IA avant son lancement ?" label="prochaine étape" href="/tools/route-finder" cta="Trouver votre route"
Utilisez le Route Finder pour décider si cela nécessite un audit IA, un périmètre d'automatisation, un parcours académique ou une construction produit complète.
:::

Système connexe : [L'audit de mise en œuvre IA avant de construire](/blog/the-ai-implementation-audit-before-you-build) décline cette même idée en un parcours d'audit pré-construction pour les équipes qui décident quoi automatiser en premier.
