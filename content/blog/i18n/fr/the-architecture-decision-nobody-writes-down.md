---
title: "La décision d'architecture que personne ne documente"
excerpt: "Nous passons des semaines à choisir entre Kafka et RabbitMQ sans jamais documenter pourquoi. Les ADR prennent 15 minutes et évitent des mois de discussions sur 'pourquoi avons-nous fait cela ?'."
sourceSlug: the-architecture-decision-nobody-writes-down
locale: fr
sourceHash: 0b9f36e97479d9e0
machineTranslated: true
---

# La Décision d'Architecture Que Personne Ne Documente

Il y a six mois, j'ai choisi Supabase plutôt que Firebase pour Nexural. J'avais de bonnes raisons — PostgreSQL, sécurité au niveau des lignes, auto-hébergeable. Mais j'ai failli oublier ces raisons. La seule chose qui m'a évité de réévaluer la même décision (et de perdre une semaine) a été un fichier markdown que j'ai écrit en 15 minutes.

## Le Problème

Chaque équipe d'ingénierie a cette conversation :

"Pourquoi utilisons-nous RabbitMQ au lieu de Kafka ?"
"Je crois que Dave a choisi ça. Dave est parti il y a 8 mois."
"..."
"Devrions-nous passer à Kafka ?"

Et maintenant vous passez un sprint à réévaluer une décision qui avait déjà été évaluée. La connaissance institutionnelle est partie par la porte.

## Architecture Decision Records (ADR)

Un ADR est un court document qui capture une décision importante. Les miens sont d'une simplicité absolue :

\\\
