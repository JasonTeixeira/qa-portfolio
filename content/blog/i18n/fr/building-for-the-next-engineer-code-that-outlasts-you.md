---
title: "Construire pour le prochain ingénieur : un code qui vous survit"
excerpt: "Chaque système que j'ai construit est conçu pour fonctionner sans moi. Ce n'est pas de la chance — c'est une conception intentionnelle pour l'exploitabilité. Voici ce que je fais différemment."
sourceSlug: building-for-the-next-engineer-code-that-outlasts-you
locale: fr
machineTranslated: true
---

# Construire pour le prochain ingénieur : un code qui vous survit

Le meilleur test de votre travail d'ingénieur, c'est ce qui se passe quand vous vous éloignez. Si quelqu'un doit vous envoyer un message "comment ça marche ?" — vous avez échoué. Les systèmes doivent continuer à tourner. Les pipelines doivent continuer à déployer. Les tableaux de bord doivent continuer à se mettre à jour.

C'est la partie la plus intentionnelle de ma pratique d'ingénieur : construire pour la personne qui viendra après moi.

## Le Test

Avant de considérer un système comme "terminé", je demande : **"Un ingénieur de niveau intermédiaire, qui n'a jamais vu ce code, pourrait-il l'exploiter sans me contacter ?"**

Si la réponse est non, je n'ai pas fini. Le code fonctionne peut-être, mais il n'est pas complet.

## À quoi ressemble "l'exploitabilité"

### 1. Un README qui répond aux 5 premières questions

Chaque nouvel ingénieur pose les mêmes 5 questions :
1. Qu'est-ce que ça fait ?
2. Comment l'exécuter en local ?
3. Comment le déployer ?
4. Où sont les logs ?
5. Qui contacter en cas de panne ?

\\\
