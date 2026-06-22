---
title: "Creación de un motor de backtesting que no te mienta"
excerpt: "La mayoría de los motores de backtesting producen resultados que se ven geniales pero se desmoronan en el trading en vivo. Así es como construí el motor de backtesting de QuantumTrader para ser honesto sobre el rendimiento."
sourceSlug: building-a-backtesting-engine-that-doesn
locale: es
machineTranslated: true
---

# Cómo construir un motor de backtesting que no te mienta

Todo trader cuantitativo ha vivido esta experiencia: el backtesting muestra un 200% de rendimiento anual. El trading en vivo muestra un -15%.

El problema casi nunca es la estrategia. Es el backtesting. La mayoría de los motores de backtesting mienten a través de supuestos optimistas.

## Las 5 mentiras que la mayoría de los backtests cuentan

### Mentira 1: Ejecuciones perfectas
La mayoría de los motores asumen que tu orden se ejecuta al precio exacto que ves. En realidad:
- Las órdenes de mercado se ejecutan al ask (comprando) o al bid (vendiendo), no al precio medio
- Las órdenes grandes mueven el mercado (deslizamiento)
- Durante la volatilidad, las ejecuciones pueden ser de 5 a 10 ticks peores de lo esperado

Mi motor modela esto:
