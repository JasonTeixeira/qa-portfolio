---
title: "Le bug qui m'a plus appris que n'importe quel cours"
excerpt: "Une condition de concurrence dans un gestionnaire de webhook de paiement est restée indétectée pendant 3 semaines. Quand elle s'est déclenchée, elle a facturé deux fois 4 clients. Voici le post-mortem complet et pourquoi je teste désormais le code de facturation différemment."
sourceSlug: the-bug-that-taught-me-more-than-any-course-ever-did
locale: fr
machineTranslated: true
---

# Le Bug Qui M'a Plus Appris Que Tous les Cours Réunis

Je veux vous parler d'un bug. Pas un bug amusant. Pas un bug malin. Le genre qui vous retourne l'estomac quand vous recevez la notification Slack à 23h un jeudi soir.

## Ce Qui S'est Passé

Je construisais la facturation par abonnement pour Nexural. Un webhook Stripe arrive —
