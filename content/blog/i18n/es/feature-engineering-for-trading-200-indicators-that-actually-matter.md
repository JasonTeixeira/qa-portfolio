---
title: "Ingeniería de características para trading: más de 200 indicadores que realmente importan"
excerpt: "Cómo construí el pipeline de ingeniería de características de AlphaStream — qué indicadores predicen el movimiento de precios, cuáles son ruido y cómo seleccionar características que generalicen."
sourceSlug: feature-engineering-for-trading-200-indicators-that-actually-matter
locale: es
sourceHash: 1ff1287097b2adc0
machineTranslated: true
---

# Ingeniería de Características para Trading: Más de 200 Indicadores Que Realmente Importan

AlphaStream calcula más de 200 indicadores técnicos para cada activo que analiza. Pero la mayoría son ruido. La parte difícil no es calcular indicadores — es seleccionar aquellos que realmente predicen el movimiento futuro del precio.

## Las Categorías de Indicadores

Organizo los indicadores en 6 grupos:

**Indicadores de Tendencia (40+):** Medias móviles (SMA, EMA, WMA, DEMA, TEMA), ADX, Aroon, Ichimoku, SAR Parabólico, SuperTrend. Te indican la dirección.

**Indicadores de Momento (35+):** RSI, MACD, Estocástico, Williams %R, CCI, ROC, MFI, Oscilador Definitivo. Te indican la fuerza.

**Indicadores de Volatilidad (25+):** Bandas de Bollinger, ATR, Canales Keltner, Canales Donchian, Desviación Estándar, Volatilidad Histórica. Te indican el riesgo.

**Indicadores de Volumen (20+):** OBV, VWAP, Línea A/D, CMF, Índice de Fuerza, Perfil de Volumen. Te indican la convicción.

**Indicadores Estadísticos (30+):** Puntuación Z, Asimetría, Curtosis, Exponente de Hurst, Autocorrelación, Puntajes de Cointegración. Te indican el régimen.

**Personalizados/Ingenierizados (50+):** Características entre marcos temporales, características de rezago, estadísticas móviles, indicadores de régimen. Ahí es donde vive el alfa.

## El Problema de Selección de Características

Más de 200 características con datos diarios crea un problema clásico de p >> n. Más características que puntos de datos útiles significa sobreajuste.

Mi enfoque:
