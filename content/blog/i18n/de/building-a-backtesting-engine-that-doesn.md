---
title: "Aufbau einer Backtesting-Engine, die nicht lügt"
excerpt: "Die meisten Backtesting-Engines liefern Ergebnisse, die großartig aussehen, aber im Live-Handel versagen. So habe ich die Backtesting-Engine von QuantumTrader gebaut, um ehrlich über die Leistung zu sein."
sourceSlug: building-a-backtesting-engine-that-doesn
locale: de
sourceHash: 452ef2f115fe23a2
machineTranslated: true
---

# Eine Backtesting-Engine bauen, die dich nicht belügt

Jeder quantitative Trader kennt diese Erfahrung: Der Backtest zeigt 200 % Jahresrendite. Der Live-Handel zeigt -15 %.

Das Problem liegt fast nie an der Strategie. Es liegt am Backtest. Die meisten Backtesting-Engines lügen durch optimistische Annahmen.

## Die 5 Lügen, die die meisten Backtests erzählen

### Lüge 1: Perfekte Ausführungen
Die meisten Engines nehmen an, dass deine Order zum exakt angezeigten Preis ausgeführt wird. In Wirklichkeit:
- Market Orders werden zum Briefkurs (Kauf) oder Geldkurs (Verkauf) ausgeführt, nicht zum Mittelkurs
- Große Orders bewegen den Markt (Slippage)
- In volatilen Phasen können Ausführungen 5–10 Ticks schlechter sein als erwartet

Meine Engine modelliert dies:
