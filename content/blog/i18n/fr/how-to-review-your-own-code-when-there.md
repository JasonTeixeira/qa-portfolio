---
title: "Comment relire votre propre code (quand il n'y a personne d'autre)"
excerpt: "Le travail en solo signifie pas de revue de code. J'ai développé un processus d'auto-relecture qui détecte 80% de ce qu'une seconde paire d'yeux trouverait. Cela commence par s'éloigner."
sourceSlug: how-to-review-your-own-code-when-there
locale: fr
machineTranslated: true
---

# Comment relire son propre code (quand il n’y a personne d’autre)

Dans les grandes équipes, chaque PR est relue par au moins un autre développeur. Chez Sage Ideas, je suis le seul développeur. Personne ne relit mon code.

C’est un problème. Pas parce que j’écris du mauvais code — mais parce que je suis aveugle à mes propres hypothèses. Comme tout développeur.

J’ai mis au point un processus d’auto-relecture qui détecte l’essentiel de ce qu’un second regard apporterait. Ce n’est pas parfait, mais c’est nettement mieux que « ça a l’air bon, on merge ».

## La règle des 24 heures

Je ne relis jamais du code que j’ai écrit aujourd’hui. L’écart minimum entre l’écriture et la relecture est de 24 heures. Idéalement 48.

Ça semble lent. En réalité, c’est rapide. Pendant ces 24 heures, je construis autre chose. Quand je reviens pour relire, j’ai partiellement oublié mon implémentation. Cet oubli est précisément le but — il me permet de lire le code comme si quelqu’un d’autre l’avait écrit.

## La checklist de relecture

Je relis en 4 passes. Chaque passe cherche des choses différentes :

### Passe 1 : Lire comme un utilisateur (5 minutes)
Ne regardez pas le code. Ouvrez le diff de la PR et lisez uniquement les noms de fichiers et le nombre de lignes.

Questions :
- La modification a-t-elle du sens rien qu’avec les noms de fichiers ?
- Touche-t-elle trop de fichiers ? (signe d’un changement couplé)
- Y a-t-il des fichiers qui ne devraient pas être dans cette modification ?

### Passe 2 : Lire pour la logique (15 minutes)
Maintenant, lisez le code. Mais ne vérifiez ni le style, ni le nommage, ni le formatage. Uniquement la logique.

Questions :
- Le chemin nominal fonctionne-t-il ?
- Que se passe-t-il avec des entrées null/undefined ?
- Y a-t-il des cas où cela échoue silencieusement ?
- Est-ce que je gère le cas d’erreur, ou je me contente de logger et de passer à autre chose ?
- Y a-t-il une condition de concurrence ? (surtout dans le code asynchrone)

### Passe 3 : Lire pour la sécurité (10 minutes)

\\\
