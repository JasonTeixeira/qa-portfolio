---
title: "Mathématiques du risque de portefeuille expliquées : VaR, CVaR et pourquoi l'estimation de la covariance est importante"
excerpt: "Les mathématiques derrière RiskRadar — Value at Risk, Conditional VaR, shrinkage de Ledoit-Wolf et simulation Monte Carlo expliquées pour les ingénieurs qui ne sont pas des quants."
sourceSlug: portfolio-risk-math-explained-var-cvar-and-why-covariance-estimation-matters
locale: fr
machineTranslated: true
---

# Mathématiques du Risque de Portefeuille Expliquées : VaR, CVaR, et Pourquoi l'Estimation de la Covariance est Importante

Quand j'ai construit RiskRadar, j'avais besoin d'implémenter des calculs de risque de niveau institutionnel. La plupart des tutoriels sur la gestion des risques soit simplifient à l'excès (« calculez juste l'écart-type »), soit supposent un niveau de mathématiques de doctorat.

Voici le juste milieu — les mathématiques dont vous avez réellement besoin pour implémenter le risque de portefeuille, expliquées pour les ingénieurs.

## Value at Risk (VaR) : Quel est le Pire Scénario Possible ?

La VaR répond à la question : « Quelle est la perte maximale que je pourrais subir en un jour, avec un niveau de confiance de 95 % ? »

Si la VaR à 95 % sur 1 jour de votre portefeuille est de 10 000 $, cela signifie que : 95 % des jours, vos pertes ne dépasseront pas 10 000 $. Les 5 % restants des jours... elles pourraient les dépasser.

**Trois méthodes pour calculer la VaR :**

### VaR Historique (la plus simple)
Classez vos rendements quotidiens historiques. Le 5e percentile correspond à votre VaR à 95 %.
