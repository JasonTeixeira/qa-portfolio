---
title: "Construire une surface produit et une carte système"
excerpt: "Un produit est plus facile à construire, vendre et enseigner lorsque vous séparez la surface visible du système d'exploitation sous-jacent."
sourceSlug: build-a-product-surface-and-system-map
locale: fr
machineTranslated: true
---

# Construire une carte de surface produit et une carte système

Un produit devient plus facile à construire quand on cesse de le considérer comme un empilement d'écrans.

Commencez par deux cartes :

1. la carte de surface
2. la carte système

La carte de surface montre ce que les gens touchent.

La carte système montre ce qui le fait fonctionner.

:::system-diagram title="Carte de construction produit" label="surface <-> système" nodes="Surface,État,Règles,Preuve"
La surface est ce que l'utilisateur voit. L'état, les règles, les intégrations et la preuve sont ce qui rend la surface crédible et maintenable.
:::

## La carte de surface

La carte de surface nomme les parcours visibles par l'utilisateur.

Pour un produit SaaS, cela peut inclure :

- page d'accueil
- inscription
- onboarding
- tableau de bord
- facturation
- paramètres
- rapports
- support

Pour un outil interne, cela peut inclure :

- formulaire de saisie
- file d'attente de travail
- page détaillée
- panneau d'approbation
- tableau de bord admin
- export

La carte de surface vous aide à voir ce que le produit demande à l'utilisateur de faire.

## La carte système

La carte système nomme la couche opérationnelle :

- auth
- rôles
- modèle de données
- tâches d'arrière-plan
- intégrations
- événements
- analytics
- facturation
- permissions
- gestion des erreurs
- journal d'audit

C'est là que les constructeurs sous-dimensionnent souvent.

Ils conçoivent le tableau de bord et oublient la file d'attente.

Ils écrivent le prompt IA et oublient l'évaluation.

Ils construisent le paiement et oublient la relance du webhook.

:::proof-note title="Exemple Nexural" label="reçu"
Nexural est utile comme référence car la surface est visible, mais le travail important se trouve en dessous : 185 tables de base de données, 69 endpoints API, facturation Stripe, workflows en temps réel, IA Discord et 61 suites de tests.
:::

## Dessinez le chemin d'échec

Une bonne carte système inclut ce qui se passe quand les choses tournent mal.

Exemples :

- le paiement échoue
- relance du webhook
- le modèle refuse
- l'utilisateur n'a pas la permission
- les données sources sont obsolètes
- l'intégration expire
- l'admin doit intervenir
- l'email rebondit

Si un produit n'a pas de chemin d'échec, c'est encore une démo.

:::checklist title="Liste de vérification de la carte système" label="préparation construction"
- Quels sont les parcours utilisateur principaux ?
- Quelles données chaque parcours lit ou écrit ?
- Quelles permissions contrôlent l'action ?
- Quelle tâche d'arrière-plan ou intégration s'exécute après le clic ?
- Que se passe-t-il en cas d'échec ?
- Quelle preuve nous indique que le système fonctionne ?
:::

## Transformez la carte en séquence de construction

La carte système devrait déterminer l'ordre de construction.

Généralement :

1. modèle de données
2. auth et rôles
3. workflow principal
4. surface
5. intégrations
6. analytics
7. preuve et documentation

Cette séquence est moins excitante que de commencer par l'écran clinquant. Elle est aussi plus durable.

:::scorecard title="Construction surface uniquement vs pilotée par le système" label="academy"
| Couche | Surface uniquement | Pilotée par le système |
| --- | --- | --- |
| UI | bel écran | workflow utilisable |
| Données | champs ad hoc | modèle nommé |
| IA | boîte de prompt | assistant évalué |
| Facturation | bouton de paiement | gestion du cycle de vie |
| Lancement | sensations | tableau de preuve |
:::

## Pourquoi c'est important pour Academy

Le parcours Academy devrait enseigner ce modèle directement.

Les constructeurs DIY n'ont pas seulement besoin d'astuces.

Ils doivent apprendre à transformer une idée en surface produit, carte système, tableau de preuve et boucle de croissance.

C'est la différence entre « j'ai fait un truc » et « j'ai construit un système ».

:::offer-cta title="Apprenez le modèle opérationnel" label="parcours academy" href="/academy" cta="Explorez l'Academy"
Si vous voulez construire de cette façon vous-même, le parcours Academy devrait commencer par la surface produit, la carte système, la preuve et la distribution au lancement.
:::
