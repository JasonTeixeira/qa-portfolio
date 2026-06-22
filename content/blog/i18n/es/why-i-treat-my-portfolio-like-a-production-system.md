---
title: "Por qué trato mi portafolio como un sistema de producción"
excerpt: "SLOs, simulacros de incidentes, limitación de tasa WAF y federación OIDC: por qué opero mi sitio de portafolio con el mismo rigor que la infraestructura empresarial, y qué señala a los gerentes de contratación."
sourceSlug: why-i-treat-my-portfolio-like-a-production-system
locale: es
machineTranslated: true
---

# Por Qué Trato Mi Portafolio Como un Sistema de Producción

La mayoría de los portafolios de desarrolladores son sitios estáticos. El mío tiene SLOs.

Esto no va de sobreingeniería. Se trata de demostrar una habilidad específica difícil de mostrar en entrevistas: **madurez operativa**.

:::proof-note title="Un portafolio puede demostrar madurez operativa" label="comprobante"
El punto no es solo el pulido visual. El punto es mostrar monitoreo, fallbacks, evidencia y comportamiento ante fallos en la misma superficie que un reclutador o comprador puede inspeccionar.
:::

## Qué Significa "Portafolio de Grado de Producción"

Mi sitio de portafolio (sageideas.dev) tiene:

- **Objetivos de SLO:** 99.9% de disponibilidad del dashboard, frescura de telemetría <24h, tiempo de respuesta P95 <500ms
- **Simulacros de incidentes:** 4 escenarios de fallo probados con respuestas documentadas
- **Limitación de tasa WAF:** Web ACL de CloudFront con evidencia de simulación de ataques
- **Federación OIDC:** GitHub Actions → AWS sin credenciales estáticas
- **Telemetría de calidad:** Dashboard en vivo que consume artefactos de CI en tiempo real
- **Comprobantes de seguridad:** Políticas IAM, modelos de amenazas y evidencia para cada afirmación

## ¿Por Qué Molestarse?

Porque la brecha entre "puedo construir cosas" y "puedo operar cosas" es donde viven los roles senior.

Los ingenieros junior construyen funcionalidades. Los ingenieros de nivel medio construyen sistemas. Los ingenieros senior **operan** sistemas — piensan en modos de fallo, radio de explosión, costo, cumplimiento y qué pasa a las 3am.

Al tratar mi portafolio como producción, estoy mostrando:

1. **Pienso en el fallo antes de que ocurra** — cada dependencia externa tiene un fallback
2. **Mido lo que importa** — SLOs, no métricas de vanidad
3. **Documento para la próxima persona** — runbooks, playbooks, documentos de arquitectura
4. **No recorto esquinas en seguridad** — incluso para un sitio de portafolio

## El Patrón de Simulacro de Incidentes

Cada trimestre, ejecuto 4 escenarios:

:::scorecard title="Simulacro de incidentes del portafolio" label="tarjeta de puntuación"
Escenario | Respuesta | Estado
Límites de tasa de API de GitHub | Retroceder a modo snapshot | Probado
Artefacto de CI faltante | Escanear ejecuciones recientes, degradar con gracia | Probado
Discrepancia de token proxy de AWS | Alarma de CloudWatch, degradación automática | Probado
Objeto S3 faltante | Fallo cerrado, sin fuga de secretos | Probado
:::

| Escenario | Respuesta | Estado |
|---|---|---|
| Límites de tasa de API de GitHub | Retroceder a modo snapshot | Probado |
| Artefacto de CI faltante | Escanear ejecuciones recientes, degradar con gracia | Probado |
| Discrepancia de token proxy de AWS | Alarma de CloudWatch, degradación automática | Probado |
| Objeto S3 faltante | Fallo cerrado, sin fuga de secretos | Probado |

Cada simulacro sigue: **detectar → triar → mitigar → verificar → documentar**

El informe del simulacro está disponible públicamente en mi biblioteca de artefactos.

## Lo Que Notan los Reclutadores

Cuando entrevisto para roles senior/staff, no hablo del diseño de mi portafolio. Hablo de sus operaciones:

- "Aquí está mi dashboard de SLO. Estamos al 99.94% este mes."
- "Aquí hay una prueba de limitación de tasa WAF que ejecuté la semana pasada. Los 429 se disparan a 100 req/5min."
- "Aquí está la política IAM. La Lambda tiene exactamente un permiso: s3:GetObject en una clave."

Esto cambia la conversación de "¿sabes programar?" a "¿sabes operar sistemas?" — que es lo que realmente requieren los roles de $200K+.

## Cómo Hacer Esto Tú Mismo

No necesitas AWS. Empieza pequeño:

1. **Define un SLO** — "Mi sitio tendrá 99% de tiempo activo este mes." Monitorea.
2. **Agrega un control de calidad** — Lighthouse CI en tu pipeline de despliegue. Falla el build si el rendimiento baja.
3. **Documenta un modo de fallo** — "Si mi clave API expira, ¿qué pasa?" Escribe la respuesta.
4. **Ejecuta un simulacro de incidente** — Rompe algo intencionalmente y practica la respuesta.

La meta no es la perfección. Es demostrar que piensas en producción, no solo en desarrollo.

:::offer-cta title="¿Necesitas este tipo de capa de evidencia?" label="siguiente paso" href="/tools/route-finder" cta="Encuentra tu ruta"
Usa el Route Finder para decidir si tu sitio necesita una auditoría, un sistema de evidencia, soporte de academia o una reconstrucción completa.
:::

Sistema relacionado: [Lo que realmente construye un estudio nativo de IA](/blog/what-an-ai-native-studio-actually-builds) explica por qué el portafolio se trata como superficie de producto, sistema operativo y bucle de crecimiento al mismo tiempo.
