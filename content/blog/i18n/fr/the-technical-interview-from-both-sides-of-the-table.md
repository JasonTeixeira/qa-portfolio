---
title: "L'entretien technique des deux côtés de la table"
excerpt: "J'ai été le candidat qui transpire à travers les questions de conception système et l'intervieweur qui les évalue. L'écart entre ce que recherchent les intervieweurs et ce que préparent les candidats est énorme."
sourceSlug: the-technical-interview-from-both-sides-of-the-table
locale: fr
machineTranslated: true
---

# L'entretien technique des deux côtés de la table

J'ai siégé des deux côtés. J'ai schématisé des architectures système sur un tableau blanc pendant qu'un recruteur hochait la tête en silence. J'ai aussi été celui qui hoche la tête, regardant un candidat concevoir un système de notification sur un tableau blanc.

L'écart entre ce que les candidats préparent et ce que les recruteurs évaluent réellement est stupéfiant.

## Ce que les candidats préparent

- Problèmes difficiles de LeetCode
- Questions obscures d'algorithmique
- « Racontez-moi une fois où… »
- Réponses mémorisées sur la conception système

## Ce que les recruteurs évaluent réellement

- **Comment vous gérez l'ambiguïté.** La première chose que je fais face à un problème de conception système est de poser des questions de clarification. « Combien d'utilisateurs ? Quelle est l'exigence de latence ? Quel est le budget ? » Les candidats qui commencent à dessiner des boîtes avant de poser des questions sont un signal d'alarme. Ils construisent sans comprendre les exigences — et ils feront de même en poste.

- **La conscience des compromis.** Il n'existe pas d'architecture parfaite. Chaque choix a un coût. Quand un candidat dit « on devrait utiliser Kafka pour la file de messages », je demande « pourquoi pas SQS ? » S'ils peuvent articuler le compromis (Kafka : débit plus élevé, plus de charge opérationnelle, meilleure relecture ; SQS : plus simple, géré, assez bon pour la plupart des cas), ils comprennent l'ingénierie. S'ils disent « Kafka est un standard de l'industrie », ils suivent aveuglément.

- **La pensée des modes de défaillance.** « Que se passe-t-il quand ce service tombe ? » Si la réponse est « il ne tombera pas », je sais qu'ils n'ont jamais opéré un système en production. Tout tombe. La question est de savoir si vous avez conçu pour cela.

- **La clarté de communication.** Pouvez-vous expliquer votre conception à une personne non technique dans la pièce ? Les postes seniors impliquent de communiquer avec les chefs de produit, les designers et les dirigeants. Si vous ne pouvez expliquer votre système qu'à d'autres ingénieurs, vous avez atteint votre plafond.

## Les questions que je pose (et ce que je teste vraiment)

**« Parcourez-moi un projet récent dont vous êtes fier. »**

Je teste : Pouvez-vous raconter une histoire cohérente ? Mentionnez-vous les contraintes, pas seulement la technologie ? Créditez-vous votre équipe ou prenez-vous tout le crédit ? Mentionnez-vous ce que vous feriez différemment ?

**« Vous recevez des erreurs 500 en production. Parcourez-moi votre processus de débogage. »**

Je teste : Avez-vous une approche systématique, ou devinez-vous ? Vérifiez-vous d'abord les logs et les métriques, ou commencez-vous à modifier le code ? Pensez-vous au rayon d'impact ?

**« Concevez un système pour [X]. Vous avez 45 minutes. »**

Je teste : Posez-vous des questions d'abord ? Commencez-vous par les exigences ou par la technologie ? Mentionnez-vous la surveillance, la gestion des erreurs et la mise à l'échelle — ou seulement le chemin heureux ?

## Ce qui a changé quand j'ai commencé à interviewer

En tant que candidat, je pensais que le recruteur voulait la « bonne réponse ». En tant que recruteur, j'ai appris qu'il n'y a pas de bonne réponse. J'évalue votre processus de réflexion.

Le candidat qui conçoit un système simple, reconnaît ses limites et explique quand il ajouterait de la complexité est plus fort que le candidat qui conçoit un système complexe qu'il ne peut pas expliquer.

## Mon conseil (des deux côtés)

**Pour les candidats :**
1. Posez 3 à 5 questions de clarification avant de concevoir quoi que ce soit
2. Commencez simple et ajoutez de la complexité quand on vous le demande
3. Mentionnez les modes de défaillance sans qu'on vous le demande (« si ce service tombe, voici ce qui se passe »)
4. Expliquez les compromis pour chaque décision majeure
5. Soyez honnête sur ce que vous ne savez pas — « Je n'ai pas utilisé Kafka à grande échelle, mais je comprends les avantages en débit. Pour ce cas d'usage, je commencerais avec SQS et migrerais si nous avons besoin de relecture »

**Pour les recruteurs :**
1. Ne testez pas la connaissance de technologies spécifiques — testez le jugement d'ingénierie
2. Demandez « que feriez-vous différemment ? » — les meilleurs ingénieurs ont des opinions fortes sur leur propre travail
3. Donnez aux candidats la possibilité de se remettre de leurs erreurs — comment ils gèrent le fait d'avoir tort en dit plus que le fait d'avoir raison

Les meilleurs entretiens ressemblent à des sessions de travail. Les pires ressemblent à des interrogatoires. Concevez pour les premiers.
