---
title: "The Bug That Taught Me More Than Any Course Ever Did"
excerpt: "A race condition in a payment webhook handler sat undetected for 3 weeks. When it fired, it double-charged 4 customers. Here's the full postmortem and why I now test billing code differently."
sourceSlug: the-bug-that-taught-me-more-than-any-course-ever-did
locale: pt
machineTranslated: true
---

# O Bug Que Me Ensinou Mais do Que Qualquer Curso

Quero contar sobre um bug. Não um divertido. Não um engenhoso. O tipo que faz seu estômago embrulhar quando você recebe a notificação no Slack às 23h de uma quinta-feira.

## O Que Aconteceu

Eu estava construindo a cobrança por assinatura para a Nexural. Chega um webhook do Stripe —
