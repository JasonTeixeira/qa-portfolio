---
title: "Ce que le trading de futures m'a appris sur l'écriture de logiciels"
excerpt: "Je trade des futures ES, NQ et CL chaque matin avant d'écrire du code. Les parallèles entre la gestion des risques dans le trading et celle dans le logiciel sont inconfortablement similaires."
sourceSlug: what-trading-futures-taught-me-about-writing-software
locale: fr
sourceHash: d440df8c786a8375
machineTranslated: true
---

# Ce que le Trading de Futures m'a Appris sur le Développement Logiciel

Chaque matin à 6h, avant d'écrire la moindre ligne de code, je scrute les graphiques de futures. ES (S&P 500), NQ (Nasdaq), CL (Pétrole Brut), GC (Or) — 8 symboles sur NinjaTrader, à la recherche de configurations.

Je trade depuis des années. Et plus je pratique les deux — trading et développement logiciel — plus je réalise qu'il s'agit de la même discipline sous des habits différents.

## Leçon 1 : La Gestion du Risque > Avoir Raison

En trading, vous pouvez avoir tort 60% du temps et quand même gagner de l'argent. Ça semble impossible, mais les maths sont simples : si vos gains sont 2 fois plus grands que vos pertes, vous n'avez besoin de gagner que 34% du temps pour atteindre l'équilibre.

C'est pareil en développement logiciel. Vous n'avez pas besoin que chaque décision architecturale soit parfaite. Vous avez besoin que les échecs soient petits et que les succès se cumulent.

C'est pourquoi je :
- Déploie de petits changements (petites trades perdantes)
- Utilise des feature flags pour les changements risqués (stop losses)
- Dispose de procédures de rollback (stratégie de sortie)
- Ne déploie jamais le vendredi (ne jamais tenir le week-end)

Un trader qui risque tout son compte sur une seule trade va exploser. Un développeur qui déploie un changement massif non testé en production va exploser. Même énergie.

## Leçon 2 : La Configuration Compte Plus que l'Entrée

Les nouveaux traders obsèdent sur le timing d'entrée. « Dois-je acheter à 4 521,25 ou 4 521,50 ? » Ça n'a pas d'importance. Ce qui compte, c'est la configuration : La tendance est-elle en votre faveur ? Y a-t-il un point d'invalidation clair ? Le risque/récompense est-il d'au moins 2:1 ?

Les nouveaux développeurs obsèdent sur le choix technologique. « Dois-je utiliser Prisma ou Drizzle ? » Ça n'a pas d'importance. Ce qui compte, c'est l'architecture : Votre modèle de données est-il solide ? Vos APIs sont-elles bien conçues ? Pouvez-vous changer d'avis plus tard sans tout réécrire ?

L'outil spécifique est l'entrée. L'architecture est la configuration. Maîtrisez la configuration et le choix de l'outil devient une erreur d'arrondi.

## Leçon 3 : Journalisez Tout

Je tiens un journal de trading. Chaque trade : entrée, sortie, raisonnement, émotions, contexte de marché, résultat, leçons. Après 6 mois, des schémas émergent. Je sur-trade le lundi. Je garde trop longtemps les perdants quand je suis fatigué. Je taille trop agressivement après une série de gains.

Je tiens maintenant l'équivalent en ingénierie : les architecture decision records (ADR). Chaque décision majeure : ce que j'ai choisi, ce que j'ai rejeté, pourquoi, ce que je changerais. Après un an de développement de Nexural, les schémas sont clairs. Je sous-investis dans la gestion des erreurs au début. Je sur-ingénie l'authentification. Je sous-estime systématiquement la complexité des migrations de base de données.

La conscience de soi par la documentation. Même pratique, domaine différent.

## Leçon 4 : Les Survivants Sont Ennuyeux

Les traders les plus prospères que je connais sont ennuyeux. Ils tradent les mêmes 2-3 configurations, jour après jour, avec les mêmes paramètres de risque. Pas de coups de YOLO. Pas de « Je me sens chanceux aujourd'hui. » Juste une exécution cohérente d'un avantage prouvé.

Les meilleures codebases où j'ai travaillé sont ennuyeuses aussi. Schémas cohérents. Structures de fichiers prévisibles. Conventions de nommage standard. Pas de hacks astucieux. Pas de « J'ai trouvé une façon cool de faire ça. » Juste du code fiable et maintenable qui fait ce qu'il dit.

L'ennui est sous-estimé dans les deux disciplines.

## Leçon 5 : Vous Tradez Contre Vous-Même

Les marchés ne se soucient pas de vous. Ils ne vous veulent pas de mal. Chaque perte est une conséquence de vos décisions, pas de la malveillance du marché.

Le logiciel ne se soucie pas de vous non plus. Les bugs ne sont pas personnels. Les pannes de production ne sont pas l'univers qui vous punit. Ce sont des conséquences de décisions — généralement prises des semaines plus tôt sous des contraintes différentes.

Prendre la responsabilité (en trading, on appelle ça « être responsable de son P&L ») est ce qui sépare les professionnels des amateurs dans les deux domaines.

## La Méta-Leçon

Le trading et le génie logiciel sont tous deux des disciplines de gestion de la complexité sous incertitude. En trading, l'incertitude est la direction du marché. En logiciel, l'incertitude est le comportement des utilisateurs, la charge système et les cas limites.

Les outils sont différents. Les principes sont identiques :
- Gérez le risque d'abord, cherchez la récompense ensuite
- Ayez un plan avant d'exécuter
- Documentez ce qui s'est passé et apprenez-en
- Soyez cohérent, pas astucieux
- Survivez assez longtemps pour cumuler votre avantage

Je construis de meilleurs logiciels parce que je trade. Et je trade mieux parce que je construis des logiciels. La pollinisation croisée est réelle.
