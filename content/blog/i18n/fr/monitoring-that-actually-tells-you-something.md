---
title: "Une Surveillance Qui Vous Dit Vraiment Quelque Chose"
excerpt: "Des tableaux de bord avec 47 panneaux où tout est vert, ce n'est pas de la surveillance. C'est de la décoration. Voici ce que je surveille réellement et pourquoi la plupart des alertes ne sont qu'un bruit inutile."
sourceSlug: monitoring-that-actually-tells-you-something
locale: fr
machineTranslated: true
---

# Une Surveillance Qui Vous Apprend Vraiment Quelque Chose

J'ai un jour hérité d'une instance Grafana avec 47 panneaux de tableau de bord. Utilisation CPU, mémoire, entrées/sorties disque, octets réseau, tas JVM — toutes les métriques imaginables. Tout était vert. Tout le temps.

Deux jours plus tard, l'API a été indisponible pendant 4 heures. Pas une seule alerte ne s'est déclenchée.

Pourquoi ? Parce que le CPU était à 22 %, la mémoire à 45 % et le disque à 30 %. Tout était « sain ». Le vrai problème était un épuisement du pool de connexions — une métrique que personne ne surveillait.

## Les Quatre Signaux d'Or (et Rien d'Autre)

Le livre SRE de Google a mis le doigt dessus. Vous avez besoin exactement de quatre signaux :

**1. Latence** — Combien de temps les requêtes prennent-elles ?
Pas la latence moyenne — elle cache les problèmes. Suivez les P50, P95 et P99 :

- P50 = 200 ms signifie que la moitié de vos utilisateurs reçoivent des réponses en 200 ms (bien)
- P95 = 800 ms signifie qu'1 utilisateur sur 20 attend 800 ms (acceptable)
- P99 = 5000 ms signifie qu'1 utilisateur sur 100 attend 5 secondes (problème)

Votre P99 est votre véritable performance. La moyenne ment.

**2. Trafic** — Combien de requêtes traitez-vous ?
C'est votre référence. Si le trafic chute de 80 % à 14h un mardi, quelque chose ne va pas, même si toutes les autres métriques sont vertes.

**3. Erreurs** — Quel pourcentage de requêtes échouent ?
Suivez le taux d'erreur, pas le nombre d'erreurs. 100 erreurs sur 1 million de requêtes (0,01 %) est acceptable. 100 erreurs sur 200 requêtes (50 %) est une panne.

**4. Saturation** — À quel point votre système est-il plein ?
Connexions base de données, mémoire, profondeur de file d'attente, pools de threads. Lorsqu'une ressource atteint 80 % d'utilisation, vous devez agir — non pas parce qu'elle est cassée, mais parce que vous avez perdu votre marge de manœuvre.

## Ma Configuration de Surveillance Réelle

Pour la plateforme Nexural :

\\\
