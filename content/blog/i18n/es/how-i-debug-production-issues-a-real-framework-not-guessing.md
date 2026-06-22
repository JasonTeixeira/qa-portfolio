---
title: "Cómo depuro problemas en producción (Un marco real, no adivinanzas)"
excerpt: "La mayoría de los desarrolladores depuran cambiando cosas hasta que el error desaparece. Yo depuro reduciendo sistemáticamente el radio de explosión. Este es mi marco real."
sourceSlug: how-i-debug-production-issues-a-real-framework-not-guessing
locale: es
sourceHash: 09346ad64da52882
machineTranslated: true
---

# Cómo Depuro Problemas en Producción (Un Marco Real, No Suposiciones)

Al inicio de mi carrera, depuraba por corazonadas. Algo se rompía, me quedaba mirando el código, cambiaba algo, redeployaba, esperaba. A veces funcionaba. A menudo empeoraba las cosas.

Cuando construyes sistemas de los que la gente depende, no puedes permitirte adivinar. Desarrollé un marco para depurar sistemáticamente. No es glamoroso, pero funciona siempre.

## El Marco: AISLAR

**A** — Identifica el síntoma (no la causa)
**I** — Acota el radio de explosión
**S** — Observa los datos (logs, métricas, trazas)
**L** — Enumera hipótesis (mínimo 3)
**A** — Evalúa cada hipótesis con evidencia
**R** — Prueba la corrección de forma aislada
**E** — Explica lo sucedido (postmortem)

Déjame guiarte a través de un ejemplo real.

## Caso Real: Dashboard Tarda 30 Segundos en Cargar

**A — Identifica el síntoma.**
Los usuarios reportan que el dashboard de calidad tarda más de 30 segundos en cargar. Localmente carga en 2 segundos. Solo en producción.

No saltes a "es un problema de base de datos" o "es un problema de red" todavía. Solo describe lo que ves.

**I — Acota el radio de explosión.**
¿Son todos los usuarios o algunos específicos? ¿Todos los navegadores? ¿Comenzó cuándo? ¿Correlacionado con un deploy?

En este caso: todos los usuarios, comenzó hace 3 días, sin deploy en esa ventana. Eso descarta "enviamos código roto" como causa.

**O — Observa los datos.**

```
