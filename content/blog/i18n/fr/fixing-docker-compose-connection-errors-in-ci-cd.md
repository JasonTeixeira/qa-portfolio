---
title: "Résolution des erreurs de connexion Docker Compose dans CI/CD"
excerpt: "J'ai passé 4 heures à déboguer des erreurs 'Connexion refusée' dans Jenkins. Voici ce que j'ai appris sur le réseau Docker dans les pipelines CI."
sourceSlug: fixing-docker-compose-connection-errors-in-ci-cd
locale: fr
machineTranslated: true
---

# Résoudre les erreurs de connexion Docker Compose dans l'IC/DC

Imaginez : votre configuration Docker Compose fonctionne parfaitement sur votre machine locale. Vous poussez vers l'IC, et soudainement tous les tests d'intégration échouent avec `Connection refused`.

Le conteneur de base de données est « en cours d'exécution ». Le conteneur API est « sain ». Le processus de test démarre. Puis il ne parvient pas à se connecter au service dont il a besoin.

Cet échec semble aléatoire jusqu'à ce que vous vous rappeliez une chose : le réseau Docker local et le réseau Docker de l'IC ne sont pas le même environnement.

:::proof-note title="La vraie leçon" label="note ic"
La plupart des erreurs de connexion Docker Compose dans l'IC ne sont pas des problèmes Docker. Ce sont des problèmes de timing, de nom d'hôte, de port ou de limite réseau que le développement local masque.
:::

## La configuration locale vous ment

Sur votre machine, vous pouvez vous connecter à Postgres via `localhost:5432`.

À l'intérieur d'un réseau Compose, un autre conteneur doit généralement se connecter à `postgres:5432`, où `postgres` est le nom du service.

Dans l'IC, l'exécuteur de tests peut être :

- à l'intérieur du réseau Compose
- à l'extérieur du réseau Compose sur l'hôte
- à l'intérieur d'un conteneur de service IC
- à l'intérieur d'un exécuteur Docker imbriqué

Ces quatre cas utilisent des noms d'hôte différents.

C'est pourquoi une chaîne de connexion peut être « correcte » localement et erronée dans le pipeline.

## D'abord, identifiez où s'exécute le processus de test

Avant de modifier les ports, posez une question :

> La commande de test s'exécute-t-elle à l'intérieur d'un service Compose ou sur l'hôte IC ?

Si les tests s'exécutent dans Compose :

```txt
DATABASE_URL=postgres://user:pass@postgres:5432/app
```

Si les tests s'exécutent sur l'hôte IC et que Compose a publié le port :

```txt
DATABASE_URL=postgres://user:pass@127.0.0.1:5432/app
```

Si les tests s'exécutent dans un conteneur IC séparé, ni l'un ni l'autre ne fonctionnera tant que la mise en réseau des services de la plateforme IC n'est pas configurée.

:::system-diagram title="Décision de mise en réseau IC" label="compose -> tests" nodes="Service Compose,Réseau,Exécuteur de tests,Base de données"
Le bon nom d'hôte dépend de l'endroit où se trouve l'exécuteur de tests. Les noms de service fonctionnent à l'intérieur du réseau Compose. Les ports localhost publiés fonctionnent depuis l'hôte.
:::

## Ne faites pas confiance à `depends_on` comme indicateur de disponibilité

`depends_on` peut contrôler l'ordre de démarrage. Il ne garantit pas que Postgres, Redis ou votre application est prête à accepter des connexions.

La version erronée courante :

```yaml
services:
  api:
    depends_on:
      - postgres
```

Cela signifie seulement que le conteneur `postgres` démarre avant `api`. Cela ne signifie pas que les migrations ont été exécutées. Cela ne signifie pas que TCP est prêt. Cela ne signifie pas que la base de données a accepté l'authentification.

Utilisez des health checks ou un script d'attente explicite.

```yaml
services:
  postgres:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 12

  api:
    depends_on:
      postgres:
        condition: service_healthy
```

Cela ne résout pas tous les problèmes de plateforme IC, mais cela élimine la course la plus courante.

## Vérifiez les quatre classes d'échec

Quand je vois `Connection refused`, je parcours cet ordre.

:::checklist title="Liste de vérification Docker Compose IC" label="ordre de débogage"
- Confirmer l'emplacement de l'exécuteur de tests : hôte, service Compose ou conteneur de service IC
- Confirmer le nom d'hôte : nom de service vs 127.0.0.1 vs alias de service de la plateforme
- Confirmer que le port publié est effectivement mappé
- Confirmer que la dépendance est saine avant le début des tests
- Afficher les variables d'environnement résolues dans l'IC sans divulguer les secrets
- Exécuter une petite vérification TCP avant la suite de tests complète
:::

La vérification TCP est banale mais utile :

```bash
node -e "require('net').connect(5432, process.env.DB_HOST).on('connect', () => { console.log('ok'); process.exit(0) }).on('error', e => { console.error(e.message); process.exit(1) })"
```

Si cela échoue, votre suite de tests d'application n'est pas encore ce qu'il faut déboguer.

## Utilisez différentes chaînes de connexion pour différentes limites

Un modèle propre consiste à rendre la limite explicite :

```env
DATABASE_URL_INTERNAL=postgres://app:app@postgres:5432/app
DATABASE_URL_HOST=postgres://app:app@127.0.0.1:5432/app
```

Ensuite, votre tâche IC choisit la bonne en fonction de l'endroit où la commande s'exécute.

C'est moins magique que d'essayer de faire fonctionner une seule URL partout.

:::scorecard title="Vérification de la chaîne de connexion" label="tableau de bord"
Emplacement de l'exécuteur | Nom d'hôte | Source du port
À l'intérieur de Compose | postgres | Port du conteneur
Hôte IC | 127.0.0.1 | Port publié
Conteneur de service IC | Alias de service | Configuration du service de la plateforme
Base de données distante | Hôte DB public/privé | Liste blanche réseau
:::

## Gardez les migrations séparées de la disponibilité

Une base de données peut être saine avant que le schéma ne soit prêt.

Si votre application a besoin de migrations, faites-en une étape explicite du pipeline :

```bash
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm test
```

Ou exécutez les tests à l'intérieur d'un service qui attend les deux :

- santé de la base de données
- migrations terminées
- données de seed chargées

Sinon, vous obtenez une classe d'échec pire : des erreurs de test intermittentes qui ressemblent à des bugs d'application mais qui sont en réalité des courses de configuration.

## La sortie de débogage que je veux dans chaque échec IC

Ne divulguez pas les secrets. Affichez la forme de l'environnement.

Sortie utile :

- Services Docker Compose et leur état
- journaux du conteneur pour la dépendance
- hôte et port résolus, avec mot de passe masqué
- noms de réseau
- état du health check
- état de la migration

Exemple :

```bash
docker compose ps
docker compose logs --tail=80 postgres
docker network ls
```

L'objectif est de rendre le prochain échec diagnostiquable en un seul passage.

## La leçon pour la production

La douleur de la mise en réseau IC est un aperçu de la douleur de l'intégration en production.

Si vos tests dépendent de l'espoir, vos déploiements aussi probablement. Rendez les limites de service explicites. Ajoutez des health checks. Séparez la disponibilité des migrations. Enregistrez les bonnes informations.

C'est ainsi que vous transformez « ça marche sur ma machine » en quelque chose qu'un pipeline peut prouver.

:::offer-cta title="Besoin de nettoyer le pipeline ?" label="prochaine étape" href="/tools/route-finder" cta="Trouvez votre route"
Utilisez le diagnostic pour décider s'il s'agit d'un sprint d'audit ciblé, d'une construction de plateforme ou d'un parcours académique que vous pouvez suivre vous-même.
:::
