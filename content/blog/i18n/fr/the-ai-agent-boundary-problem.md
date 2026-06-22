---
title: "Le problème de frontière des agents IA"
excerpt: "La partie difficile des agents IA n'est pas de leur donner des outils. C'est de décider où l'agent s'arrête, où le logiciel commence, et où un humain doit rester responsable."
sourceSlug: the-ai-agent-boundary-problem
locale: fr
sourceHash: 2ec6d495d801e51c
machineTranslated: true
---

# Le problème de la frontière des agents IA

Le moyen le plus simple de donner l'impression qu'un agent IA est puissant est de lui accorder trop d'autorité.

Laissez-le tout lire. Laissez-le écrire partout. Laissez-le appeler l'API, envoyer l'e-mail, mettre à jour le CRM, rembourser la facture et s'expliquer ensuite dans un paragraphe confiant.

Ce n'est pas un produit. C'est un incident d'autorisations qui attend une invitation à un calendrier.

La partie difficile des agents n'est pas l'utilisation d'outils. La partie difficile, c'est la frontière.

:::proof-note title="La frontière est le produit" label="note de terrain"
Un agent IA n'est pas plus sûr parce que le prompt semble prudent. Il est plus sûr lorsque le système environnant contrôle les outils, les autorisations, les approbations, les journaux et les conditions d'arrêt.
:::

## Un agent n'est pas un intitulé de poste

« Agent commercial » n'est pas une spécification.

« Agent de support », « agent de recherche » ou « agent d'exploitation » non plus. Ces expressions décrivent un employé fantasmé, pas une frontière logicielle.

Une spécification d'agent utile nomme la boucle réelle :

- lire ces entrées
- choisir parmi ces actions
- demander une approbation dans ces conditions
- écrire dans ces systèmes
- journaliser ces décisions
- s'arrêter quand cela se produit

Plus la boucle est petite, meilleur est l'agent.

L'agent doit posséder une seule surface de décision. Routage. Rédaction. Extraction. Vérification. Rapprochement. Pas « gérer les opérations ».

:::system-diagram title="Carte des frontières de l'agent" label="surface -> système" nodes="Entrée,Politique,Approbation,Audit"
L'agent visible n'est que la surface. Le produit durable est le système qui l'entoure : politique, limites des outils, portes d'approbation et piste d'audit.
:::

## Les outils doivent être étroits, pas impressionnants

La plupart des démos d'agents montrent une liste d'outils comme une vitrine de trophées.

Le meilleur modèle de production est ennuyeux :

- un outil de recherche
- un outil de lecture structurée
- un outil de rédaction
- un outil d'écriture avec une porte d'approbation
- un chemin d'escalade

Chaque outil doit faire moins que ce que le modèle veut qu'il fasse. Le modèle peut demander. Le système décide.

Si un outil peut modifier des données, il a besoin de contraintes en dehors du prompt. Validation de schéma. Listes d'autorisation. Limites de débit. Clés d'idempotence. Journaux d'audit. Approbation humaine lorsque l'argent, l'accès ou la réputation sont en jeu.

Le prompt n'est pas le modèle d'autorisation.

## Les humains ne sont pas une solution de repli pour une mauvaise conception

« Humain dans la boucle » est utilisé comme une phrase décorative.

Cela devrait signifier un véritable point de contrôle. Un humain voit l'action proposée, les preuves sources, la raison, le risque et le diff exact. Il peut approuver, modifier, rejeter ou rediriger ailleurs.

Si l'écran de révision ne montre que la réponse finale, le réviseur ne révise pas. Il devine avec une meilleure typographie.

Un bon écran d'approbation montre :

- ce qui a changé
- pourquoi l'agent pense que cela devrait changer
- quelles sources il a utilisées
- ce qu'il n'a pas pu vérifier
- ce qui se passe si le réviseur dit oui

C'est la différence entre un workflow et un tour de magie.

## Le logiciel classique est toujours autorisé

Tous les workflows n'ont pas besoin d'un agent.

Si l'arbre de décision est stable, écrivez du logiciel. Si la sortie doit être exacte, écrivez du logiciel. Si l'entrée est structurée et l'action déterministe, écrivez du logiciel.

Utilisez un agent là où le langage, l'ambiguïté et le jugement sont le véritable problème.

Cela signifie généralement que l'agent se situe à la périphérie d'un système, traduisant une entrée humaine désordonnée en travail structuré. Il ne remplace pas le système. Il l'alimente.

## La liste de contrôle des frontières

Avant de construire un agent, je veux cinq phrases :

:::checklist title="Liste de contrôle des frontières de l'agent" label="liste de contrôle"
- L'agent est autorisé à décider d'une chose étroite.
- L'agent n'est pas autorisé à modifier l'argent, l'accès ou la réputation sans révision.
- Chaque action d'écriture a une validation de schéma en dehors du prompt.
- L'approbation humaine montre les preuves, la raison, le risque et le diff exact.
- Chaque action atterrit dans un journal d'audit.
:::

1. L'agent est autorisé à décider ___.
2. L'agent n'est pas autorisé à décider ___.
3. L'agent peut appeler ces outils : ___.
4. L'agent doit demander à un humain avant ___.
5. Chaque action est journalisée dans ___.

Si ces phrases sont difficiles à écrire, l'agent n'est pas prêt à être construit.

La frontière est le produit.

:::offer-cta title="Besoin d'un workflow IA cadré en toute sécurité ?" label="prochaine étape" href="/tools/route-finder" cta="Trouvez votre route"
Utilisez le Route Finder pour décider s'il s'agit d'un audit d'automatisation, d'une construction complète en studio ou d'un parcours d'apprentissage à l'académie.
:::
