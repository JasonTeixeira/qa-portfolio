---
title: "Gestion des erreurs qui respecte vos utilisateurs"
excerpt: "Vos utilisateurs se fichent des traces de pile. Ils veulent savoir ce qui a mal tourné et quoi faire ensuite. Voici comment je conçois des expériences d'erreur qui aident au lieu de frustrer."
sourceSlug: error-handling-that-respects-your-users
locale: fr
machineTranslated: true
---

# Gestion des erreurs qui respecte vos utilisateurs

La plupart des gestions d'erreurs sont écrites pour l'ingénieur qui connaît déjà le système.

C'est l'inverse qu'il faudrait faire.

L'utilisateur ne se soucie pas qu'un webhook Stripe ait expiré, qu'une politique Supabase ait rejeté la ligne, ou qu'un fournisseur de modèle ait renvoyé une 429. Il se soucie de trois choses :

- ce qui s'est passé
- si son travail est en sécurité
- ce qu'il peut faire ensuite

Si l'interface ne peut pas répondre à ces questions, le message d'erreur n'aide pas. Il ne fait que divulguer des détails d'implémentation.

:::proof-note title="Le standard que j'utilise" label="règle d'opérateur"
Un état d'erreur fait partie de la surface produit. Il doit être conçu avec le même soin que le parcours nominal, car c'est souvent le moment où la confiance est soit protégée, soit perdue.
:::

## Commencez par la tâche de l'utilisateur, pas par l'exception

La première ébauche d'un message d'erreur ressemble généralement au chemin de code :

> Échec de la création de la session de paiement.

C'est peut-être vrai, mais ce n'est pas utile. Une meilleure version commence par l'intention de l'utilisateur :

> Nous n'avons pas pu ouvrir le paiement. Les détails de votre projet ont été sauvegardés. Réessayez, ou réservez un appel et nous le terminerons manuellement.

Ce message remplit quatre fonctions :

- nomme l'action qui a échoué
- confirme si les données ont été sauvegardées
- donne une prochaine étape
- évite de blâmer l'utilisateur

L'erreur interne peut toujours être enregistrée avec le fournisseur, le code d'état, l'ID de requête et la trace de pile. L'utilisateur n'a pas besoin de tout cela.

## Séparez le texte utilisateur de la télémétrie technique

La surface produit et la surface d'observabilité ne devraient pas porter la même charge.

:::system-diagram title="Flux d'erreur respectueux" label="surface -> télémétrie" nodes="Action utilisateur,Barrière d'erreur, Texte utilisateur,Télémétrie"
L'utilisateur voit un chemin de récupération clair. Le système conserve la trace de pile, l'ID de requête, la réponse du fournisseur et le routage d'alerte pour l'opérateur.
:::

En production, je veux deux sorties pour la même défaillance :

- un message lisible par l'humain sur la page
- un événement lisible par la machine dans les logs, les analytics et les alertes

Le texte utilisateur doit être calme et spécifique. La télémétrie peut être dense et laide si nécessaire. Mélanger les deux crée soit des logs inutiles, soit des interfaces hostiles.

## Les bons états d'erreur répondent à cinq questions

Quand je révise un état d'erreur, je le passe en revue avec cette liste de contrôle.

:::checklist title="Liste de contrôle des états d'erreur" label="qa ux"
- Dit-il quelle action a échoué ?
- Dit-il si les données de l'utilisateur sont en sécurité ?
- Propose-t-il une prochaine étape réaliste ?
- Évite-t-il d'exposer des secrets, des traces de pile ou des éléments internes du fournisseur ?
- La télémétrie capture-t-elle suffisamment de détails pour que l'opérateur puisse déboguer ?
:::

Si la réponse est non, l'état n'est pas terminé.

Par exemple, un échec de formulaire de prospect ne devrait pas dire `500 Erreur Interne du Serveur`. Il devrait dire quelque chose comme :

> Nous n'avons pas pu envoyer le message. Votre navigateur est resté sur cette page, donc rien n'a été perdu. Réessayez ou envoyez les détails du projet directement par email.

Ensuite, les logs du serveur devraient contenir la cause réelle : échec de validation, délai d'attente Resend, échec d'insertion Supabase, ou rejet de webhook.

## Concevez la solution de repli avant que le système ne tombe en panne

Les équipes ajoutent généralement des états de repli après le premier incident de production. C'est coûteux car la panne est déjà publique.

Pour les flux importants, j'aime définir le repli pendant la construction de la fonctionnalité :

| Flux | Repli utilisateur | Signal opérateur |
|---|---|---|
| Paiement | Sauvegarder le chemin, proposer un lien de réservation | erreur du fournisseur de paiement avec métadonnées de session |
| Formulaire de contact | Conserver le message à l'écran, afficher l'email direct | erreur de capture de prospect avec source et forme de la charge utile |
| Génération IA | Préserver le prompt, proposer une nouvelle tentative | fournisseur, modèle, latence et métadonnées de token |
| Téléchargement de fichier | Afficher la limite de fichier et le chemin de nouvelle tentative | erreur de stockage, taille, type MIME, ID d'organisation |

Le repli n'a pas besoin d'être sophistiqué. Il doit préserver la dynamique.

## Ne rendez pas chaque erreur identique

Les messages génériques donnent l'impression que le produit est négligent :

- Quelque chose s'est mal passé.
- Réessayez plus tard.
- Une erreur inattendue s'est produite.

Parfois, ils sont acceptables comme filets de sécurité finaux, mais ils ne devraient pas être le seul langage d'erreur dans le produit.

Différentes défaillances nécessitent différents chemins de récupération :

- erreur de validation : afficher le champ exact et le format attendu
- erreur de permission : expliquer quel rôle ou compte est requis
- limite de débit : dire quand réessayer ou proposer une action plus légère
- défaillance de dépendance : préserver le travail de l'utilisateur et montrer un chemin alternatif
- échec d'action destructive : indiquer clairement ce qui n'a pas changé

Le but n'est pas de faire paraître le système parfait. Le but est de faire en sorte que l'utilisateur se sente orienté quand il ne l'est pas.

:::scorecard title="Qualité du texte d'erreur" label="tableau de bord"
Motif | Faible | Fort
Validation | Entrée invalide | Utilisez un email professionnel ou supprimez les caractères non pris en charge
Défaillance fournisseur | Échec du paiement | Le paiement ne s'est pas ouvert. Les détails de votre projet sont sauvegardés.
Permission | Non autorisé | Vous avez besoin d'un accès administrateur pour modifier les paramètres de facturation
Limite de débit | Trop de requêtes | Attendez 60 secondes avant de lancer une autre vérification
Inconnu | Quelque chose s'est mal passé | Nous n'avons pas pu terminer cette action. Votre brouillon est toujours là.
:::

## L'opérateur a besoin d'une interface différente

Un texte utilisateur respectueux ne fonctionne que si l'opérateur reçoit toujours les preuves réelles.

Cela signifie enregistrer :

- la route et l'action
- l'ID de requête ou de trace
- l'ID utilisateur/organisation quand disponible
- le fournisseur et le code d'état
- la forme sécurisée de la charge utile
- le timing
- le nombre de tentatives

Cela signifie aussi ne pas enregistrer les secrets, les tokens bruts, les détails de carte de paiement, les documents privés, ou les prompts complets lorsque ces prompts peuvent contenir des données client.

Une bonne gestion des erreurs n'est pas une journalisation plus douce. C'est une séparation plus nette.

## Le modèle que j'essaie de livrer

Pour chaque action importante, je veux cette structure :

1. Valider tôt et afficher des conseils au niveau du champ.
2. Encapsuler l'action serveur/la route API dans une gestion d'erreur structurée.
3. Renvoyer un message utilisateur stable et un code machine stable.
4. Enregistrer le contexte complet sécurisé pour l'opérateur.
5. Suivre l'échec comme un événement produit s'il affecte la conversion.
6. Préserver la saisie utilisateur autant que possible.

Ce n'est pas un travail glamour, mais cela fait partie de la sensation premium. Le site qui sauvegarde votre travail et vous dit quoi faire ensuite semble plus digne de confiance que le site qui affiche une boîte rouge et vous fait tout recommencer.

:::offer-cta title="Vous voulez auditer les chemins d'échec ?" label="prochaine étape" href="/tools/route-finder" cta="Trouvez votre route"
Utilisez le Route Finder pour décider si votre produit a besoin d'une construction studio, d'un sprint d'audit, d'un périmètre d'automatisation ou d'un parcours académique.
:::
