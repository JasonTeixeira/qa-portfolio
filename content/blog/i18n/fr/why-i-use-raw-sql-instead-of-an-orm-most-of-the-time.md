---
title: "Pourquoi j'utilise du SQL brut plutôt qu'un ORM (la plupart du temps)"
excerpt: "Les ORM sont géniaux jusqu'à ce qu'ils ne le soient plus. Après avoir débogué des requêtes générées qui prenaient 30 secondes sur une base de données de 185 tables, je suis passé au SQL brut pour les chemins critiques. Voici quand chacun a du sens."
sourceSlug: why-i-use-raw-sql-instead-of-an-orm-most-of-the-time
locale: fr
sourceHash: 8704afb8dd6233ff
machineTranslated: true
---

# Pourquoi j'utilise du SQL brut plutôt qu'un ORM (la plupart du temps)

Ça va faire débat, alors laissez-moi commencer par une mise au point : les ORM sont bien. Prisma, SQLAlchemy, Drizzle — ce sont tous de bons outils construits par des gens intelligents. Je les utilise.

Mais pour la plateforme Nexural — 185 tables, des jointures complexes, des vues matérialisées, une sécurité au niveau des lignes — le SQL brut était le bon choix pour les chemins critiques. Voici pourquoi.

## Le moment où j'ai basculé

J'utilisais Prisma. Le tableau de bord se chargeait en 200ms en local. En production avec des données réelles, il fallait 4,2 secondes.

J'ai exécuté \\\
