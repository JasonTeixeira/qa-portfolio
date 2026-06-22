---
title: "Ce que j'ai appris en construisant en public en tant qu'ingénieur solo"
excerpt: "Un an à construire l'écosystème Nexural, à trader des futures, à écrire un livre et à tout documenter. Les victoires, les échecs et ce que je dirais à quelqu'un qui commence aujourd'hui."
sourceSlug: what-i-learned-building-in-public-as-a-solo-engineer
locale: fr
sourceHash: 8efdb4e4031bcb97
machineTranslated: true
---

# Ce que j'ai appris en construisant en public en tant qu'ingénieur solo

Il y a un an, j'ai quitté mon poste chez HighStrike et fondé Sage Ideas LLC. Depuis, j'ai construit une plateforme fintech avec 185 tables de base de données, un bot Discord alimenté par IA, un système de signaux de trading ML, un livre de 120 000 mots sur le trading, et ce site portfolio.

Voici ce que j'ai appris.

## La solitude est réelle

L'ingénierie solo signifie :
- Pas de revues de code (tu révises ton propre code)
- Pas de discussions d'architecture (tu te disputes avec toi-même)
- Personne pour repérer tes angles morts (tu les découvres en production)
- Personne pour célébrer les victoires (tu pousses sur main et tu passes à autre chose)

La solution : j'ai commencé à documenter mes décisions. Chaque décision d'architecture majeure obtient un fichier markdown expliquant ce que j'ai choisi et pourquoi. C'est une conversation avec mon futur moi — et maintenant c'est du contenu pour mon portfolio.

## Livrer chaque semaine, pas chaque mois

Mes 3 premiers mois, j'ai construit pendant 4 semaines avant de déployer. Je trouvais des bugs, je réalisais que j'avais construit la mauvaise chose, et je perdais des jours à refactoriser.

Maintenant je livre chaque semaine. Parfois chaque jour. Les petits déploiements signifient :
- Moins de risque par déploiement
- Retour plus rapide
- Rollbacks plus faciles
- Progrès visibles (crucial pour la motivation)

## Le 80/20 de l'ingénierie solo

**20 % du travail qui produit 80 % de la valeur :**
- Conception du schéma de base de données (fais-le bien et tout l'aval est plus facile)
- Définition des contrats d'API (les schémas Zod attrapent 90 % des bugs d'intégration)
- Configuration CI/CD (les déploiements automatisés = tu livres plus)
- Surveillance des erreurs (savoir les bugs avant que les utilisateurs ne les signalent)

**80 % du travail qui produit 20 % de la valeur :**
- UI pixel-perfect (les utilisateurs se soucient de la fonction, pas du poids de la police)
- Optimisation des performances avant d'avoir des utilisateurs
- Écrire des tests pour du code qui va changer la semaine prochaine
- Choisir la stack technique "parfaite"

## La réalité financière

Je suis un trader actif de futures. Les revenus du trading financent la construction. C'est un luxe que la plupart des constructeurs solo n'ont pas.

Sans revenus de trading, j'aurais eu besoin :
- D'au moins 6 mois d'économies
- D'un chemin de monétisation clair avant de construire
- De clients payants avant de construire des fonctionnalités

Construire en public sans pression de revenus est un privilège. Construire en public AVEC pression de revenus est de l'entrepreneuriat. Ils nécessitent des stratégies différentes.

## Ce qui m'a réellement fait embaucher (entretiens et intérêt)

Après avoir construit tout ça, voici ce qui intéresse vraiment les recruteurs et clients potentiels :

1. **"Tu as construit une plateforme avec 185 tables ?"** — L'échelle impressionne. Pas le nombre en lui-même, mais le fait que je l'ai conçue et gérée en solo.

2. **"Tu trades les mêmes instruments que ton logiciel analyse ?"** — L'expertise domaine est rare. La plupart des développeurs fintech n'utilisent pas leurs propres produits.

3. **"Où est la démo en direct ?"** — Le tableau de bord qualité sur mon site portfolio a lancé plus de conversations que mon CV. Les gens peuvent le voir fonctionner.

4. **"Tu as écrit un livre de 120 000 mots ?"** — Cela signale l'engagement, la réflexion approfondie et les compétences en communication. Personne n'écrit 120 000 mots à la légère.

5. **"Montre-moi le GitHub"** — Ils veulent voir du vrai code, de vrais commits, de vraies pipelines CI. Pas une page portfolio polie — le dépôt réel.

## Ce que je dirais à quelqu'un qui commence aujourd'hui

1. **Choisis une chose et livre-la.** Ne construis pas une "plateforme". Construis une seule fonctionnalité, déploie-la, et montre-la à une personne. Puis construis la fonctionnalité suivante.

2. **Documente de manière obsessionnelle.** Ta documentation est ton portfolio. Tes messages de commit sont ton journal de travail. Tes docs d'architecture sont tes études de cas.

3. **Construis ce que tu utilises.** J'ai construit des outils de trading parce que je trade. J'ai construit des frameworks de test parce que je teste. La conviction transparaît quand tu construis pour toi-même.

4. **N'optimise pas avant d'avoir des utilisateurs.** Livre la version moche. Obtiens des retours. Ensuite, peaufine.

5. **Ton portfolio EST le projet.** Le méta-projet de maintenir un site portfolio avec des SLOs, des exercices d'incident et des artefacts de preuve est en soi une preuve de maturité technique.

## Un an plus tard

J'ai construit plus en un an en solo que beaucoup d'équipes construisent en deux. Pas parce que je suis plus rapide — parce que je n'ai pas de réunions, pas de planning poker, pas de cérémonies sprint, et pas de frais généraux organisationnels.

Le compromis est la solitude, le doute de soi, et la question constante : "Est-ce assez bien ?" La réponse est toujours "livre-le et découvre-le."
