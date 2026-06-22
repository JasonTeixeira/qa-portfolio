---
title: "Diseñando un esquema de base de datos de 185 tablas: Lecciones de la construcción de Nexural"
excerpt: "Cómo diseñé un esquema de base de datos normalizado para una plataforma fintech con 7 sistemas interconectados. Fases del esquema, políticas RLS, compensaciones de desnormalización y estrategias de migración."
sourceSlug: designing-a-185-table-database-schema-lessons-from-building-nexural
locale: es
machineTranslated: true
---

# Diseñando un Esquema de Base de Datos de 185 Tablas: Lecciones de la Construcción de Nexural

Cuando la gente oye "185 tablas de base de datos," asumen complejidad por la complejidad misma. Pero cada tabla existe porque un requisito de negocio la exigió.

Así es como diseñé el esquema de Nexural — las decisiones que funcionaron, las que cambiaría y los patrones que escalan.

:::system-diagram title="Crecimiento del esquema de Nexural" label="esquema -> sistemas" nodes="Auth,Facturación,Trading,Ops"
La base de datos no comenzó como un esquema gigante. Creció a medida que los dominios del producto se volvieron reales: usuarios, suscripciones, flujos de trabajo de trading, funciones comunitarias, analíticas, investigación y operaciones.
:::

## Diseño de Esquema por Fases

No diseñé 185 tablas el primer día. El esquema creció a lo largo de 7 fases, cada una añadiendo un dominio:

:::scorecard title="Fases de construcción del esquema" label="scorecard"
Fase | Dominio | Tablas | Decisión clave
1 | Auth y Usuarios | 12 | Supabase Auth + perfiles personalizados
2 | Suscripciones | 8 | Máquina de estados impulsada por webhooks de Stripe
3 | Trading | 35 | Instrumentos, posiciones, señales, listas de seguimiento
4 | Comunidad | 25 | Sincronización con Discord, registros de moderación, reputación
5 | Analíticas | 30 | Métricas, informes, eventos de telemetría
6 | Investigación | 40 | Estrategias, indicadores, resultados de backtesting
7 | Operaciones | 35 | Alertas, boletines, registros de auditoría
:::

| Fase | Dominio | Tablas | Decisión Clave |
|------|---------|--------|---------------|
| 1 | Auth y Usuarios | 12 | Supabase Auth + perfiles personalizados |
| 2 | Suscripciones | 8 | Máquina de estados impulsada por webhooks de Stripe |
| 3 | Trading | 35 | Instrumentos, posiciones, señales, listas de seguimiento |
| 4 | Comunidad | 25 | Sincronización con Discord, registros de moderación, reputación |
| 5 | Analíticas | 30 | Métricas, informes, eventos de telemetría |
| 6 | Investigación | 40 | Estrategias, indicadores, resultados de backtesting |
| 7 | Operaciones | 35 | Alertas, boletines, registros de auditoría |

Cada fase tuvo su propio lote de migraciones. Nunca modifiqué tablas de una fase anterior durante el desarrollo de una nueva fase. Esto mantuvo seguros los despliegues.

## Las Tres Reglas que Seguí

### Regla 1: Normalizar Todo Excepto las Rutas Críticas

Los datos canónicos siempre están normalizados. \
