---
title: "Pourquoi je gère mon portfolio comme un système de production"
excerpt: "SLO, exercices d'incident, limitation de débit WAF et fédération OIDC — pourquoi j'opère mon site portfolio avec la même rigueur que l'infrastructure d'entreprise, et ce que cela signale aux recruteurs."
sourceSlug: why-i-treat-my-portfolio-like-a-production-system
locale: fr
sourceHash: 378dd32b468864fc
machineTranslated: true
---

# Pourquoi je traite mon portfolio comme un système de production

La plupart des portfolios de développeurs sont des sites statiques. Le mien a des SLO.

Il ne s'agit pas de sur-ingénierie. Il s'agit de démontrer une compétence spécifique difficile à montrer en entretien : **la maturité opérationnelle**.

:::proof-note title="Un portfolio peut prouver la maturité opérationnelle" label="reçu"
L'objectif n'est pas uniquement le soin visuel. Il s'agit de montrer la supervision, les solutions de repli, les preuves et le comportement en cas d'échec sur la même surface qu'un responsable du recrutement ou un acheteur peut inspecter.
:::

## Ce que signifie « Portfolio de qualité production »

Mon site portfolio (sageideas.dev) dispose de :

- **Objectifs SLO :** 99,9 % de disponibilité du tableau de bord, fraîcheur de la télémétrie <24h, temps de réponse P95 <500ms
- **Exercices d'incident :** 4 scénarios de défaillance testés avec des réponses documentées
- **Limitation de débit WAF :** Web ACL CloudFront avec preuve de simulation d'attaque
- **Fédération OIDC :** GitHub Actions → AWS sans identifiants statiques
- **Télémétrie de qualité :** Tableau de bord en direct extrayant les artefacts CI en temps réel
- **Reçus de sécurité :** Politiques IAM, modèles de menace et preuves pour chaque affirmation

## Pourquoi se donner cette peine ?

Parce que l'écart entre « je sais construire des choses » et « je sais faire fonctionner des choses » est l'espace où se situent les postes seniors.

Les ingénieurs juniors construisent des fonctionnalités. Les ingénieurs de niveau intermédiaire construisent des systèmes. Les ingénieurs seniors **exploitent** les systèmes — ils réfléchissent aux modes de défaillance, au rayon d'explosion, au coût, à la conformité et à ce qui se passe à 3h du matin.

En traitant mon portfolio comme de la production, je montre :

1. **Je pense à l'échec avant qu'il ne survienne** — chaque dépendance externe a une solution de repli
2. **Je mesure ce qui compte** — des SLO, pas des métriques de vanité
3. **Je documente pour la personne suivante** — runbooks, playbooks, documents d'architecture
4. **Je ne fais pas de compromis sur la sécurité** — même pour un site portfolio

## Le modèle d'exercice d'incident

Chaque trimestre, j'exécute 4 scénarios :

:::scorecard title="Exercice d'incident du portfolio" label="scorecard"
Scénario | Réponse | Statut
Limites de débit de l'API GitHub | Repli en mode snapshot | Testé
Artefact CI manquant | Analyse des exécutions récentes, dégradation gracieuse | Testé
Non-concordance du jeton proxy AWS | Alarme CloudWatch, auto-dégradation | Testé
Objet S3 manquant | Échec fermé, aucune fuite de secrets | Testé
:::

| Scénario | Réponse | Statut |
|---|---|---|
| Limites de débit de l'API GitHub | Repli en mode snapshot | Testé |
| Artefact CI manquant | Analyse des exécutions récentes, dégradation gracieuse | Testé |
| Non-concordance du jeton proxy AWS | Alarme CloudWatch, auto-dégradation | Testé |
| Objet S3 manquant | Échec fermé, aucune fuite de secrets | Testé |

Chaque exercice suit : **détection → triage → atténuation → vérification → documentation**

Le rapport d'exercice est accessible publiquement dans ma bibliothèque d'artefacts.

## Ce que les recruteurs remarquent

Quand je passe des entretiens pour des postes senior/staff, je ne parle pas du design de mon portfolio. Je parle de son exploitation :

- « Voici mon tableau de bord SLO. Nous sommes à 99,94 % ce mois-ci. »
- « Voici un test de limitation de débit WAF que j'ai effectué la semaine dernière. Les 429 se déclenchent à 100 req/5min. »
- « Voici la politique IAM. La Lambda a exactement une permission : s3:GetObject sur une clé. »

Cela change la conversation de « savez-vous coder ? » à « savez-vous faire fonctionner des systèmes ? » — ce qui est ce que les postes à plus de 200 000 $ exigent réellement.

## Comment faire cela vous-même

Vous n'avez pas besoin d'AWS. Commencez petit :

1. **Définissez un SLO** — « Mon site aura 99 % de disponibilité ce mois-ci. » Surveillez-le.
2. **Ajoutez une porte de qualité** — Lighthouse CI dans votre pipeline de déploiement. Échouez la build si les performances chutent.
3. **Documentez un mode de défaillance** — « Si ma clé API expire, que se passe-t-il ? » Écrivez la réponse.
4. **Exécutez un exercice d'incident** — Cassez réellement quelque chose intentionnellement et entraînez-vous à répondre.

L'objectif n'est pas la perfection. C'est de démontrer que vous pensez à la production, pas seulement au développement.

:::offer-cta title="Besoin de ce type de couche de preuve ?" label="étape suivante" href="/tools/route-finder" cta="Trouvez votre route"
Utilisez le Route Finder pour décider si votre site a besoin d'un audit, d'un système de preuve, d'un support académique ou d'une reconstruction complète.
:::

Système connexe : [Ce qu'un studio natif IA construit réellement](/blog/what-an-ai-native-studio-actually-builds) explique pourquoi le portfolio est traité à la fois comme surface produit, système d'exploitation et boucle de croissance.
