---
title: "Ingénierie des caractéristiques pour le trading : plus de 200 indicateurs qui comptent vraiment"
excerpt: "Comment j'ai construit le pipeline d'ingénierie des caractéristiques d'AlphaStream — quels indicateurs prédisent les mouvements de prix, lesquels sont du bruit, et comment sélectionner des caractéristiques qui généralisent."
sourceSlug: feature-engineering-for-trading-200-indicators-that-actually-matter
locale: fr
sourceHash: 1ff1287097b2adc0
machineTranslated: true
---

# Feature Engineering pour le Trading : 200+ Indicateurs Qui Comptent Vraiment

AlphaStream calcule plus de 200 indicateurs techniques pour chaque titre qu'il analyse. Mais la plupart ne sont que du bruit. La difficulté ne réside pas dans le calcul des indicateurs — c'est la sélection de ceux qui prédisent réellement les mouvements de prix futurs.

## Les Catégories d'Indicateurs

J'organise les indicateurs en 6 groupes :

**Indicateurs de Tendance (40+) :** Moyennes mobiles (SMA, EMA, WMA, DEMA, TEMA), ADX, Aroon, Ichimoku, Parabolic SAR, SuperTrend. Ils indiquent la direction.

**Indicateurs de Momentum (35+) :** RSI, MACD, Stochastic, Williams %R, CCI, ROC, MFI, Ultimate Oscillator. Ils indiquent la force.

**Indicateurs de Volatilité (25+) :** Bandes de Bollinger, ATR, Canaux de Keltner, Canaux de Donchian, Écart-type, Volatilité Historique. Ils indiquent le risque.

**Indicateurs de Volume (20+) :** OBV, VWAP, Ligne A/D, CMF, Force Index, Volume Profile. Ils indiquent la conviction.

**Indicateurs Statistiques (30+) :** Z-Score, Asymétrie, Kurtosis, Exposant de Hurst, Autocorrélation, Scores de Cointegration. Ils indiquent le régime.

**Indicateurs Personnalisés/Conçus (50+) :** Caractéristiques inter-temporelles, caractéristiques décalées, statistiques glissantes, indicateurs de régime. C'est là que se trouve l'alpha.

## Le Problème de Sélection des Caractéristiques

Plus de 200 caractéristiques avec des données quotidiennes créent un problème classique p >> n. Plus de caractéristiques que de points de données utiles signifie un surapprentissage.

Mon approche :
