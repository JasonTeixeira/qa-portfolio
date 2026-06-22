---
title: "Limitation de débit : la fonctionnalité à laquelle personne ne pense avant qu'il ne soit trop tard"
excerpt: "Votre API fonctionne parfaitement à 10 requêtes par seconde. À 10 000, elle s'effondre. Voici comment j'implémente une limitation de débit qui protège sans gêner les utilisateurs légitimes."
sourceSlug: rate-limiting-the-feature-nobody-thinks-about-until-it
locale: fr
sourceHash: c38601b0fe30159a
machineTranslated: true
---

# Limitation de Débit : La Fonctionnalité à Laquelle Personne Ne Pense Avant Qu'il Ne Soit Trop Tard

Personne ne met « implémenter la limitation de débit » sur le tableau du sprint. Ce n'est pas une user story. Ça ne fait pas bouger une métrique. Le produit ne le demande jamais.

Puis un jour, quelqu'un envoie 50 000 requêtes à votre API en 30 secondes et votre base de données fond. Ou pire — un script incontrôlé d'un seul utilisateur vous coûte 800 $ en invocations AWS Lambda en une nuit.

Ces deux situations me sont arrivées. Maintenant, la limitation de débit fait partie de mon modèle de démarrage.

## Les Trois Couches

J'implémente la limitation de débit à trois niveaux, car chacun attrape différents schémas d'abus :

### Couche 1 : Edge (CloudFront / Vercel)

\\\
