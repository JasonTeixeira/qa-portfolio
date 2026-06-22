---
title: "Creando una Plataforma Fintech en Solitario: 185 Tablas, 69 APIs, 7 Sistemas"
excerpt: "La historia completa de la arquitectura y construcción del ecosistema Nexural desde cero — diseño de base de datos, arquitectura de API, integración con Stripe y lecciones de ser el único ingeniero en una plataforma fintech en producción."
sourceSlug: building-a-fintech-platform-solo-185-tables-69-apis-7-systems
locale: es
sourceHash: 23f602ed84078e28
machineTranslated: true
---

# Construyendo una Plataforma Fintech en Solitario: 185 Tablas, 69 APIs, 7 Sistemas

La mayoría de los ingenieros trabajan en un servicio a la vez. Yo construí un ecosistema completo.

La plataforma Nexural comenzó como una idea simple: un panel para mi comunidad de trading. Se convirtió en una plataforma fintech completa con 185 tablas de base de datos, 69 endpoints de API, facturación con Stripe, un bot de Discord con IA, un motor de investigación, un estudio de newsletters y un sistema de alertas en tiempo real.

Diseñé y construí todo. Esto es lo que aprendí.

Sistema relacionado: [Construye un mapa de superficie y sistema de producto](/blog/build-a-product-surface-and-system-map) convierte el mismo patrón de superficie/sistema en un marco de trabajo repetible para constructores.

## El Alcance

Siete sistemas interconectados:
1. **Panel de Trading** — datos de mercado en tiempo real, gráficos, seguimiento de cartera
2. **Motor de IA para Discord** — más de 30 comandos, integración con GPT-4o, moderación automática
3. **Motor de Investigación** — más de 71 métricas, análisis de estrategias, importación CSV
4. **Sistema de Alertas** — integración con NinjaTrader 8, backend en .NET, notificaciones en tiempo real
5. **Estudio de Newsletter** — generación y distribución automatizada de contenido
6. **Rastreador de Estrategias** — monitoreo de rendimiento en sistemas de trading
7. **Suite de Automatización** — 61 suites de pruebas, CI/CD, puertas de calidad

## Diseño de Base de Datos a Escala

185 tablas suena intimidante. La clave fue el diseño por fases:

- **Fase 1 (Núcleo):** Usuarios, autenticación, suscripciones — 20 tablas
- **Fase 2 (Trading):** Instrumentos, posiciones, señales — 35 tablas
- **Fase 3 (Comunidad):** Integración con Discord, registros de moderación — 25 tablas
- **Fase 4 (Analítica):** Métricas, informes, telemetría — 30 tablas
- **Fase 5-7:** Investigación, alertas, newsletter — 75 tablas

Cada fase tuvo su propia migración, su propio conjunto de pruebas y su propio plan de reversión. Nunca modifiqué más de un dominio a la vez.

### Decisiones de Esquema que Importaron

**Normalizado donde cuenta:** Usuario → Suscripción → Plan está completamente normalizado. Sin atajos de desnormalización que pudieran crear errores de facturación.

**Desnormalizado donde la velocidad importa:** Los paneles de trading consultan vistas desnormalizadas. A un trader no le importa la 3FN — le importan tiempos de carga inferiores a 50 ms.

**Seguridad a nivel de fila en todas partes:** Políticas RLS de Supabase en cada tabla. Un usuario nunca puede ver los datos de otro usuario, incluso si la API tiene un error.

## Arquitectura de API

69 endpoints siguiendo patrones consistentes:

\
