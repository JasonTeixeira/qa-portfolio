---
title: "Éliminer les tests instables : une approche systématique"
excerpt: "Comment j'ai fait passer une suite de tests d'un taux d'instabilité de 10 % à moins de 1 % — logique de réessai, isolation des tests, données déterministes et les schémas qui rendent les tests fiables."
sourceSlug: eliminating-flaky-tests-a-systematic-approach
locale: fr
sourceHash: b780b5a56a15f8e6
machineTranslated: true
---

# Éliminer les tests instables : une approche systématique

Un test instable est un test qui réussit parfois et échoue parfois sans aucune modification du code. À un taux d'instabilité de 10 %, les développeurs cessent de faire confiance à la suite de tests. À 20 %, ils arrêtent de l'exécuter.

J'ai fait passer des suites de tests de 10 % d'instabilité à moins de 1 %. Voici l'approche systématique.

## Étape 1 : Mesurer le taux d'instabilité

On ne peut pas corriger ce qu'on ne mesure pas. Suivez l'instabilité dans le temps :

\
