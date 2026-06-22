---
title: "GitHub OIDC → AWS (sans clés persistantes) : l'automatisation cloud comme il se doit"
excerpt: "Comment utiliser GitHub Actions OIDC pour endosser un rôle IAM AWS et déployer/télécharger des artefacts sans stocker de clés AWS. Inclut IAM au moindre privilège, modèles de politique de confiance et astuces de dépannage."
sourceSlug: github-oidc-aws-no-long-lived-keys-cloud-automation-the-right-way
locale: fr
sourceHash: bfc0536b90edf6b9
machineTranslated: true
---

# GitHub OIDC → AWS (Pas de clés permanentes) : l'automatisation cloud comme il se doit

Les clés AWS statiques dans l'IC sont une véritable bombe à retardement.

Si vous voulez une automatisation cloud qui passe à l'échelle (et qui résiste à un audit de sécurité), utilisez la **fédération basée sur OIDC** :

- GitHub Actions émet un jeton d'identité à durée de vie limitée (OIDC)
- AWS STS l'échange contre des identifiants AWS temporaires
- Votre workflow assume un rôle à privilèges minimaux et exécute le travail

Ce portfolio utilise le même modèle pour prendre en charge le **mode télémétrie cloud** (AWS S3) sans jamais intégrer d'identifiants permanents.

## L'architecture
