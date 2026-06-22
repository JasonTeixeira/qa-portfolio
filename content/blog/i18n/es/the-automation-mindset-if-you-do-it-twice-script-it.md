---
title: "La mentalidad de automatización: si lo haces dos veces, conviértelo en script"
excerpt: "Tengo 47 scripts de shell, 6 flujos de CI y un cron job que me envía un mensaje cuando mi certificado SSL está por vencer. Esta es la mentalidad detrás de automatizar todo."
sourceSlug: the-automation-mindset-if-you-do-it-twice-script-it
locale: es
machineTranslated: true
---

# La Mentalidad de Automatización: Si lo Haces Dos Veces, Conviértelo en Script

El martes pasado, ejecuté una migración de base de datos, probé 3 endpoints de API, revisé los registros del webhook de Stripe, verifiqué que el pipeline de CI estuviera en verde y desplegué a producción. Tiempo total: 4 minutos.

Antes solía tomar 45.

La diferencia no es que me haya vuelto más rápido haciendo clic en botones. Es que dejé de hacer clic en botones por completo.

## La Regla

**Si hago algo manualmente dos veces, lo automatizo la tercera vez.**

No "cuando tenga tiempo". No "en el próximo sprint". La tercera vez. Porque la cuarta vez viene, y la quinta, y la centésima.

## Mi Stack de Automatización

### Script de Despliegue (reemplazó 12 pasos manuales)

\\\
