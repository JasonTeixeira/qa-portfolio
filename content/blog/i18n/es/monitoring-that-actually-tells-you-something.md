---
title: "Monitoreo Que Realmente Te Dice Algo"
excerpt: "Los paneles con 47 gráficos donde todo está en verde no son monitoreo. Son decoración. Esto es lo que realmente monitoreo y por qué la mayoría de las alertas son ruido inútil."
sourceSlug: monitoring-that-actually-tells-you-something
locale: es
sourceHash: 4c2fd7867d8e623f
machineTranslated: true
---

# Monitoreo Que Realmente Te Dice Algo

Una vez heredé una instancia de Grafana con 47 paneles de dashboard. Utilización de CPU, uso de memoria, E/S de disco, bytes de red, heap de JVM — cada métrica que puedas imaginar. Todo estaba en verde. Todo el tiempo.

Dos días después, la API estuvo caída durante 4 horas. Ni una sola alerta se disparó.

¿Por qué? Porque la CPU estaba al 22%, la memoria al 45% y el disco al 30%. Todo "saludable". El problema real era un agotamiento del pool de conexiones — una métrica que nadie estaba vigilando.

## Las Cuatro Señales Doradas (y Nada Más)

El libro de SRE de Google lo definió perfectamente. Necesitas exactamente cuatro señales:

**1. Latencia** — ¿Cuánto tardan las solicitudes?
No la latencia promedio — eso oculta problemas. Monitorea P50, P95 y P99:

- P50 = 200ms significa que la mitad de tus usuarios reciben respuestas en 200ms (bien)
- P95 = 800ms significa que 1 de cada 20 usuarios espera 800ms (aceptable)
- P99 = 5000ms significa que 1 de cada 100 usuarios espera 5 segundos (problema)

Tu P99 es tu rendimiento real. El promedio miente.

**2. Tráfico** — ¿Cuántas solicitudes estás manejando?
Esta es tu línea base. Si el tráfico cae un 80% a las 2pm un martes, algo está mal incluso si todas las demás métricas están en verde.

**3. Errores** — ¿Qué porcentaje de solicitudes fallan?
Monitorea la tasa de error, no el conteo de errores. 100 errores de 1 millón de solicitudes (0.01%) está bien. 100 errores de 200 solicitudes (50%) es una interrupción.

**4. Saturación** — ¿Qué tan lleno está tu sistema?
Conexiones de base de datos, memoria, profundidad de cola, pools de hilos. Cuando cualquier recurso alcanza el 80% de utilización, necesitas actuar — no porque esté roto, sino porque has perdido tu margen de maniobra.

## Mi Configuración Real de Monitoreo

Para la plataforma Nexural:
