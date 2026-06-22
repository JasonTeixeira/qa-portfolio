---
title: "Créer un moteur de backtesting qui ne vous ment pas"
excerpt: "La plupart des moteurs de backtesting produisent des résultats qui semblent excellents mais s'effondrent en trading réel. Voici comment j'ai conçu le moteur de backtesting de QuantumTrader pour être honnête sur les performances."
sourceSlug: building-a-backtesting-engine-that-doesn
locale: fr
machineTranslated: true
---

# Construire un Moteur de Backtesting Qui Ne Vous Ment Pas

Tout trader quantitatif a vécu cette expérience : le backtesting affiche des rendements annuels de 200 %. Le trading en direct affiche -15 %.

Le problème ne vient presque jamais de la stratégie. Il vient du backtesting. La plupart des moteurs de backtesting mentent à travers des hypothèses optimistes.

## Les 5 Mensonges Que La Plupart des Backtests Raconte

### Mensonge 1 : Exécutions Parfaites
La plupart des moteurs supposent que votre ordre s'exécute au prix exact que vous voyez. En réalité :
- Les ordres au marché s'exécutent au ask (achat) ou au bid (vente), pas au prix médian
- Les ordres importants font bouger le marché (slippage)
- En période de volatilité, les exécutions peuvent être 5 à 10 ticks moins bonnes que prévu

Mon moteur modélise cela :
\
