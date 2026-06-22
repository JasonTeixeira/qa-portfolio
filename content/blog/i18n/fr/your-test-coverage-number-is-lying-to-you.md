---
title: "Votre taux de couverture de test vous ment"
excerpt: "80 % de couverture ne signifie rien si vous testez les mauvais 80 %. Voici comment je considère la couverture — non pas comme un chiffre à atteindre, mais comme une carte de vos angles morts."
sourceSlug: your-test-coverage-number-is-lying-to-you
locale: fr
machineTranslated: true
---

# Votre Taux de Couverture de Test Vous Ment

J'ai vu des bases de code avec 95% de couverture de test qui livrent des bugs critiques chaque semaine. J'ai vu des bases de code avec 40% de couverture qui plantent rarement.

Le nombre n'est pas le problème. L'obsession du nombre l'est.

## Le Piège de la Couverture

Voici un test qui augmente la couverture mais ne détecte rien :

\\\
