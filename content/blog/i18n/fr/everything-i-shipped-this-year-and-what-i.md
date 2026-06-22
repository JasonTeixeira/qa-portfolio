---
title: "Tout ce que j'ai livré cette année (et ce que je supprimerais avec le recul)"
excerpt: "Bilan de fin d'année : 7 systèmes, 185 tables, 51 articles de blog, un livre et une carrière de trader. Ce qui en valait la peine, ce qui n'en valait pas, et ce que je construis ensuite."
sourceSlug: everything-i-shipped-this-year-and-what-i
locale: fr
sourceHash: 53f4663a4013d75d
machineTranslated: true
---

# Tout ce que j'ai livré cette année (et ce que je supprimerais avec le recul)

Il y a un an, j'ai fondé Sage Ideas LLC avec un plan vague : créer des outils de trading, proposer du conseil, et voir ce qui se passe. Voici le bilan honnête.

## Ce que j'ai livré

**L'écosystème Nexural** — 7 systèmes interconnectés :
1. Tableau de bord de trading (185 tables, 69 APIs, facturation Stripe)
2. Moteur IA Discord (30+ commandes, GPT-4o, 12 phases)
3. Moteur de recherche (71+ métriques, analyse de stratégies)
4. Système d'alertes (.NET 8, intégration NinjaTrader)
5. Studio Newsletter (pipeline de contenu automatisé)
6. Suivi de stratégies (analytiques de performance)
7. Suite d'automatisation (61 suites de tests)

**AlphaStream** — Signaux de trading ML (200+ indicateurs, 5 modèles)

**RiskRadar** — Plateforme de risque de portefeuille (Ledoit-Wolf, CVaR, optimisation)

**Ce Portfolio** — Le site que vous lisez. SLOs, exercices d'incidents, tableau de bord en direct, 27 artefacts, 51 articles de blog.

**Le Livre** — 120 000 mots sur le trading. 24 chapitres. En phase éditoriale.

**Trading Actif** — 8 symboles sur NinjaTrader. ES, NQ, CL, GC, et plus.

## Ce qui a valu chaque heure

**La plateforme Nexural.** C'est la pièce maîtresse de mon portfolio. Chaque entretien et conversation client commence par « vous avez construit une plateforme avec 185 tables ? » La profondeur de ce projet ouvre des portes qu'une douzaine de petits projets n'ouvriraient jamais.

**Le Blog.** 51 articles constituent un corpus qui signale « cette personne réfléchit en profondeur. » Chaque article est un artefact partageable. Quand je postule à un emploi, j'inclus un lien vers un article pertinent. C'est plus convaincant qu'une puce sur un CV.

**La Page d'Ingénierie de Plateforme.** SLOs, exercices d'incidents, reçus de sécurité — cette page à elle seule a transformé les conversations d'entretien de « savez-vous coder ? » à « parlez-moi de votre expérience opérationnelle. » Ce changement fait la différence entre des offres de niveau intermédiaire et senior.

## Ce que je supprimerais

**Nexural Newsletter Studio.** Construit, à peine utilisé. La communauté de trading voulait des alertes Discord, pas des newsletters par email. J'aurais dû valider la demande avant de construire.

**Plusieurs Frameworks de Test d'API.** J'ai 3 dépôts qui font des choses similaires : API-Test-Automation-Wireframe, API-Testing-Framework, et la suite de tests API dans E-Commerce-Test-Suite. J'aurais dû construire un excellent framework au lieu de trois médiocres.

**La suite de tests de régression visuelle.** L'intégration Percy est cool, mais le dépôt a 1 commit et teste 1 page. Si j'avais passé ces heures à améliorer E-Commerce-Test-Suite, mon meilleur dépôt QA serait encore plus solide.

## Ce que j'ai appris sur la construction

**Livrez la première version moche.** Le premier déploiement du tableau de bord Nexural était embarrassant. Pas de style, mise en page mobile cassée, données factices. Mais il était en ligne, j'ai eu des retours, et la version 2 était 10 fois meilleure grâce à ça.

**Documentez en construisant, pas après.** Chaque système documenté en amont était plus facile à maintenir. Chaque système pour lequel j'ai dit « je documenterai plus tard » est devenu une boîte mystère en 3 mois.

**Votre portfolio EST le travail.** J'ai passé plus de temps sur sageideas.dev que sur la plupart des projets clients. Le ROI a été énorme — intérêt entrant, conversations d'entretien qui commencent à un niveau plus élevé, et preuve de maturité opérationnelle qu'aucune puce de CV ne peut égaler.

## Ce que je construis ensuite

J'ai trois choses sur ma feuille de route :

1. **Améliorer les projets existants.** Les 11 dépôts publics de mon portfolio ont besoin de READMEs plus solides, de plus de commits, d'une meilleure CI, et de vraies captures d'écran. La qualité plutôt que la quantité.

2. **Une bibliothèque de modules Terraform.** Des modules AWS réutilisables pour les motifs que j'ai construits plusieurs fois. Cela comble le vide d'infrastructure dans mon portfolio.

3. **Contributions open-source.** Même de petites PRs à des projets établis ajoutent de la crédibilité. Je veux 5 à 10 contributions significatives à des projets que j'utilise réellement (Next.js, Supabase, Playwright).

## Les chiffres honnêtes

| Métrique | Valeur |
|----------|--------|
| Systèmes livrés | 7 |
| Tables de base de données conçues | 185 |
| Points d'API construits | 69 |
| Articles de blog écrits | 50 |
| Mots du livre écrits | 120 000 |
| Certifications obtenues | 9 |
| Suites de tests en cours | 61 |
| Commits GitHub | 500+ |
| Revenus générés | Privé, mais assez pour financer la construction |
| Heures travaillées | Trop pour les compter |

## Le bilan

Construire en public pendant un an m'a appris que le travail lui-même est le portfolio. Pas une liste de puces — les vrais systèmes en fonctionnement, les articles de blog honnêtes, la documentation qui vous survit.

Si vous commencez votre propre marque d'ingénierie, mon conseil est simple : construisez des choses réelles, documentez de manière obsessionnelle, soyez honnête sur les échecs, et livrez avant d'être prêt.

Le portfolio parfait n'existe pas. Celui qui est livré, si.
