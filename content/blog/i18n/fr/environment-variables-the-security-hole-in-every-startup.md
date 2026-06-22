---
title: "Variables d'environnement : la faille de sécurité dans chaque startup"
excerpt: "Votre fichier .env contient le mot de passe de votre base de données, la clé secrète Stripe et les identifiants AWS. Il traîne dans un message Slack, sur l'ordinateur d'un développeur, et probablement dans une image Docker quelque part. Corrigeons cela."
sourceSlug: environment-variables-the-security-hole-in-every-startup
locale: fr
machineTranslated: true
---

# Variables d'Environnement : La Faille de Sécurité dans Chaque Startup

Audit rapide : où se trouve votre mot de passe de base de données en ce moment ?

Si vous avez répondu "fichier .env à la racine du dépôt" — vous êtes dans la majorité. Si vous avez répondu "aussi dans un message Slack au nouveau collaborateur, une capture d'écran dans Confluence, et codé en dur dans cette fonction Lambda que Dave a écrite avant de partir" — vous êtes honnête.

Les variables d'environnement sont l'infrastructure la plus dangereuse dans la plupart des startups parce que tout le monde les traite comme une réflexion après coup.

## Les Erreurs Courantes

### Erreur 1 : .env dans le Contrôle de Version

Je l'ai vu dans des dépôts de production dans de vraies entreprises. Un \
