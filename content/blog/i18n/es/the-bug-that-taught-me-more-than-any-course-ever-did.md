---
title: "El error que me enseñó más que cualquier curso"
excerpt: "Una condición de carrera en un manejador de webhook de pagos pasó desapercibida durante 3 semanas. Cuando se activó, cobró dos veces a 4 clientes. Aquí está la autopsia completa y por qué ahora pruebo el código de facturación de manera diferente."
sourceSlug: the-bug-that-taught-me-more-than-any-course-ever-did
locale: es
sourceHash: c708a0d3fda65b18
machineTranslated: true
---

# El Bug Que Me Enseñó Más Que Cualquier Curso

Quiero contarte sobre un bug. No uno divertido. No uno ingenioso. El tipo que te hace caer el estómago cuando recibes la notificación de Slack a las 11pm un jueves.

## Lo Que Sucedió

Estaba construyendo la facturación de suscripciones para Nexural. Llega un webhook de Stripe —
