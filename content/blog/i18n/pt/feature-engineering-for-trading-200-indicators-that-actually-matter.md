---
title: "Feature Engineering para Trading: Mais de 200 Indicadores que Realmente Importam"
excerpt: "Como construí o pipeline de feature engineering da AlphaStream — quais indicadores preveem movimento de preço, quais são ruído e como selecionar features que generalizam."
sourceSlug: feature-engineering-for-trading-200-indicators-that-actually-matter
locale: pt
machineTranslated: true
---

# Feature Engineering para Trading: 200+ Indicadores que Realmente Importam

O AlphaStream calcula mais de 200 indicadores técnicos para cada ativo que analisa. Mas a maioria deles é ruído. A parte difícil não é calcular indicadores — é selecionar aqueles que realmente preveem movimentos futuros de preço.

## As Categorias de Indicadores

Organizo os indicadores em 6 grupos:

**Indicadores de Tendência (40+):** Médias móveis (SMA, EMA, WMA, DEMA, TEMA), ADX, Aroon, Ichimoku, Parabolic SAR, SuperTrend. Eles indicam a direção.

**Indicadores de Momentum (35+):** RSI, MACD, Stochastic, Williams %R, CCI, ROC, MFI, Ultimate Oscillator. Eles indicam a força.

**Indicadores de Volatilidade (25+):** Bollinger Bands, ATR, Keltner Channels, Donchian Channels, Standard Deviation, Historical Volatility. Eles indicam o risco.

**Indicadores de Volume (20+):** OBV, VWAP, A/D Line, CMF, Force Index, Volume Profile. Eles indicam a convicção.

**Indicadores Estatísticos (30+):** Z-Score, Skewness, Kurtosis, Hurst Exponent, Autocorrelation, Cointegration scores. Eles indicam o regime.

**Customizados/Projetados (50+):** Features entre timeframes, features de lag, estatísticas móveis, indicadores de regime. É aqui que o alpha reside.

## O Problema da Seleção de Features

Mais de 200 features com dados diários criam um problema clássico p >> n. Mais features do que pontos de dados úteis significa overfitting.

Minha abordagem:
