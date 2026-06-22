---
title: "Feature Engineering für den Handel: 200+ Indikatoren, die wirklich zählen"
excerpt: "Wie ich die Feature-Engineering-Pipeline von AlphaStream aufgebaut habe – welche Indikatoren Kursbewegungen vorhersagen, welche Rauschen sind und wie man Merkmale auswählt, die generalisieren."
sourceSlug: feature-engineering-for-trading-200-indicators-that-actually-matter
locale: de
sourceHash: 1ff1287097b2adc0
machineTranslated: true
---

# Feature Engineering für Trading: 200+ Indikatoren, die wirklich zählen

AlphaStream berechnet für jedes analysierte Wertpapier über 200 technische Indikatoren. Aber die meisten davon sind Rauschen. Der schwierige Teil ist nicht das Berechnen der Indikatoren – es ist die Auswahl derjenigen, die tatsächlich zukünftige Kursbewegungen vorhersagen.

## Die Indikatorkategorien

Ich unterteile Indikatoren in 6 Gruppen:

**Trendindikatoren (40+):** Gleitende Durchschnitte (SMA, EMA, WMA, DEMA, TEMA), ADX, Aroon, Ichimoku, Parabolic SAR, SuperTrend. Sie zeigen die Richtung an.

**Momentumindikatoren (35+):** RSI, MACD, Stochastic, Williams %R, CCI, ROC, MFI, Ultimate Oscillator. Sie zeigen die Stärke an.

**Volatilitätsindikatoren (25+):** Bollinger Bänder, ATR, Keltner Channels, Donchian Channels, Standardabweichung, Historische Volatilität. Sie zeigen das Risiko an.

**Volumenindikatoren (20+):** OBV, VWAP, A/D Line, CMF, Force Index, Volume Profile. Sie zeigen die Überzeugung an.

**Statistische Indikatoren (30+):** Z-Score, Schiefe, Kurtosis, Hurst-Exponent, Autokorrelation, Kointegrationswerte. Sie zeigen das Regime an.

**Benutzerdefinierte/Konstruierte (50+):** Zeitrahmenübergreifende Merkmale, Verzögerungsmerkmale, rollierende Statistiken, Regimeindikatoren. Hier liegt das Alpha.

## Das Problem der Merkmalsauswahl

Über 200 Merkmale mit täglichen Daten erzeugen ein klassisches p >> n Problem. Mehr Merkmale als nutzbare Datenpunkte bedeuten Überanpassung.

Mein Ansatz:
