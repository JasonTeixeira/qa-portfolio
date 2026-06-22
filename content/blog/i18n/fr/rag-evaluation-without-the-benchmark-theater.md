---
title: "Évaluation RAG sans le théâtre des benchmarks"
excerpt: "Une approche concrète pour évaluer la génération augmentée par récupération : couverture des sources, fidélité des citations, comportement de refus et utilité au niveau de la tâche."
sourceSlug: rag-evaluation-without-the-benchmark-theater
locale: fr
sourceHash: 0c9b12c23086a8ae
machineTranslated: true
---

# Évaluation RAG sans le Théâtre des Benchmarks

La première démo RAG fonctionne toujours.

Vous téléchargez le PDF propre. Vous posez la question évidente. Le modèle trouve le paragraphe évident et répond sur le ton d’un consultant bien financé.

Puis un utilisateur pose la question avec le mauvais acronyme, la politique a changé il y a trois semaines, la réponse se trouve dans deux documents, et le système cite un paragraphe qui semble pertinent mais ne soutient pas réellement l’affirmation.

C’est là que le produit commence.

## La récupération est la première décision produit

La qualité RAG commence avant que le modèle ne voie quoi que ce soit.

La couche de récupération décide ce que le modèle est autorisé à savoir. Si les mauvais fragments reviennent, la réponse est déjà compromise. Une meilleure invite peut masquer le problème. Elle ne le résoudra pas.

J’évalue la récupération avec des questions simples :

- Le bon document est-il apparu dans les premiers résultats ?
- La bonne section est-elle apparue, pas seulement le bon fichier ?
- Le contenu le plus récent a-t-il surpassé le contenu plus ancien ?
- La requête a-t-elle fonctionné lorsqu’elle était formulée comme un vrai utilisateur le ferait ?
- Le système n’a-t-il rien renvoyé lorsque rien n’était la réponse honnête ?

Ce dernier point compte. Un système de recherche qui renvoie toujours quelque chose apprend au modèle à toujours dire quelque chose.

## La fidélité des citations prime sur la confiance dans la réponse

La réponse ne suffit pas.

Pour tout système de connaissances, je veux savoir si la source citée soutient réellement la phrase affirmée.

Cela signifie évaluer au niveau de l’affirmation, pas seulement au niveau de la réponse. Si la réponse contient quatre affirmations et que seulement deux sont soutenues, la réponse n’est pas « plutôt correcte ». Elle est dangereuse d’une manière qui semble soignée.

Une grille simple fonctionne :

- Soutenue : la citation prouve directement l’affirmation.
- Partielle : la citation est liée mais ne prouve pas entièrement l’affirmation.
- Non soutenue : la citation ne prouve pas l’affirmation.
- Contredite : la citation dit le contraire.

Vous n’avez pas besoin d’un benchmark élaboré pour commencer. Vous avez besoin de 30 vraies questions et de la discipline pour marquer honnêtement les échecs.

## Le refus est une fonctionnalité

Les systèmes RAG doivent savoir quand ne pas répondre.

Cela signifie tester des questions où le corpus ne contient pas la réponse. Cela signifie aussi tester des questions où la réponse est sensible, obsolète, ou dépend d’un contexte que l’utilisateur n’a pas fourni.

Un bon comportement de refus ressemble à :

« Je ne vois pas cela dans les sources disponibles. Le document le plus proche est X, mais il ne répond pas directement à la question. »

Un mauvais comportement de refus ressemble à :

« D’après les informations disponibles, il semble que… »

Cette phrase est le moment où les hallucinations mettent un blazer.

## Le tableau de bord utile

Pour un système RAG interne, je préfère suivre cinq métriques fondées plutôt qu’un seul score de benchmark impressionnant :

1. Taux de réussite de la récupération : la bonne source est-elle apparue ?
2. Fidélité des citations : la source a-t-elle soutenu la réponse ?
3. Précision du refus : a-t-il refusé les questions non soutenues ?
4. Utilité de la réponse : l’utilisateur a-t-il pu passer à l’étape suivante ?
5. Distance d’édition : combien un humain a-t-il dû modifier ?

La dernière métrique est la plus honnête. Si les utilisateurs réécrivent constamment la réponse, le système ne leur fait pas gagner du temps. Il crée un premier brouillon poli qu’ils doivent superviser.

## Commencez assez petit pour mesurer

Le bon premier système RAG n’est généralement pas le « cerveau de l’entreprise ».

C’est un corpus, un workflow, un type d’utilisateur, et une action claire après la réponse. Macros de support. Activation des ventes. Recherche de politique. Documentation technique interne. Recherche de clauses contractuelles.

Un périmètre restreint rend l’évaluation possible.

L’évaluation rend la confiance possible.

La confiance rend l’expansion possible.

Cet ordre compte.
