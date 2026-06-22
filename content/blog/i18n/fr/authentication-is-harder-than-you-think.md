---
title: "L'authentification est plus difficile que vous ne le pensez"
excerpt: "J'ai implémenté l'authentification 4 fois dans différents projets. Chaque fois, je pensais que cela prendrait 2 jours. Chaque fois, cela a pris 2 semaines. Voici pourquoi, et ce que je ferais différemment."
sourceSlug: authentication-is-harder-than-you-think
locale: fr
machineTranslated: true
---

# L'authentification est plus complexe que vous ne le pensez

Chaque plan de projet que j'ai jamais écrit comporte une ligne : "Authentification — 2 jours."

Chaque rétrospective de projet contient une note : "L'auth a pris 2 semaines."

J'ai construit des systèmes d'authentification 4 fois maintenant. Chaque fois, je sous-estime la tâche. Voici pourquoi, et ce que j'ai finalement appris.

## L'iceberg

Ce que vous pensez que l'authentification est :
- Formulaire de connexion
- Stocker un jeton
- Vérifier si le jeton est valide
- Terminé

Ce qu'est réellement l'authentification :
- Formulaire de connexion (email/mot de passe + OAuth + liens magiques + MFA ?)
- Hachage des mots de passe (bcrypt, argon2, quel facteur de coût ?)
- Gestion des sessions (JWT vs cookie de session vs les deux ?)
- Rafraîchissement des jetons (rafraîchissement silencieux, rotation, révocation)
- Protection CSRF (cookies same-site, jeton à double soumission)
- Limitation de débit (sur la connexion, sur l'inscription, sur la réinitialisation du mot de passe)
- Flux de réinitialisation du mot de passe (génération de jeton, expiration, usage unique)
- Vérification de l'email (jeton, logique de renvoi, que faire s'ils changent d'email ?)
- Verrouillage du compte (combien de tentatives ? Quel est le flux de déverrouillage ?)
- Contrôle d'accès basé sur les rôles (admin vs utilisateur vs modérateur)
- Gestion des clés API (pour l'accès programmatique)
- Invalidation de session lors du changement de mot de passe
- "Se souvenir de moi" vs "cette session uniquement"
- Notification de connexion depuis un nouvel appareil
- Journalisation d'audit (qui s'est connecté, quand, depuis où)

Cela représente 15+ fonctionnalités. À 1-2 jours chacune, vous en avez pour un mois.

## Ce que je fais maintenant : utiliser Supabase Auth et étendre

Après avoir construit une authentification personnalisée deux fois et avoir détesté ma vie les deux fois, je commence maintenant avec Supabase Auth (ou Clerk, ou Auth.js). Cela gère :

- Email/mot de passe avec bcrypt
- Fournisseurs OAuth (Google, GitHub, Discord)
- Jetons JWT avec rafraîchissement
- Vérification de l'email
- Réinitialisation du mot de passe
- Gestion des sessions
- Limitation de débit

Cela représente 80% de l'authentification, gérée par des personnes qui pensent à l'authentification à plein temps. Je me concentre sur les 20% qui sont spécifiques à mon application :

\\\
