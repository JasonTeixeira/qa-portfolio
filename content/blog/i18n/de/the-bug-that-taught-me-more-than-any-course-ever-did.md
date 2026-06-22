---
title: "Der Fehler, der mich mehr lehrte als jeder Kurs"
excerpt: "Eine Race-Condition in einem Zahlungs-Webhook-Handler blieb 3 Wochen unentdeckt. Als sie zuschlug, wurden 4 Kunden doppelt belastet. Hier die vollständige Postmortem-Analyse und warum ich Abrechnungscode jetzt anders teste."
sourceSlug: the-bug-that-taught-me-more-than-any-course-ever-did
locale: de
sourceHash: c708a0d3fda65b18
machineTranslated: true
---

# Der Bug, der mich mehr lehrte als jeder Kurs

Ich möchte dir von einem Bug erzählen. Keinem lustigen. Keinem cleveren. Der Sorte, bei der dir der Magen umkippt, wenn du die Slack-Benachrichtigung um 23 Uhr an einem Donnerstag bekommst.

## Was passierte

Ich baute das Abonnement-Abrechnungssystem für Nexural. Ein Stripe-Webhook kommt rein —
