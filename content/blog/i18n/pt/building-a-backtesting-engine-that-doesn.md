---
title: "Construindo um Motor de Backtesting que Não Mente para Você"
excerpt: "A maioria dos motores de backtesting produz resultados que parecem ótimos, mas desmoronam no trading ao vivo. Veja como construí o motor de backtesting do QuantumTrader para ser honesto sobre o desempenho."
sourceSlug: building-a-backtesting-engine-that-doesn
locale: pt
sourceHash: 452ef2f115fe23a2
machineTranslated: true
---

# Construindo um Motor de Backtesting Que Não Mente para Você

Todo trader quantitativo já passou por isso: o backtest mostra retornos anuais de 200%. A negociação ao vivo mostra -15%.

O problema quase nunca é a estratégia. É o backtest. A maioria dos motores de backtesting mente por meio de suposições otimistas.

## As 5 Mentiras que a Maioria dos Backtests Conta

### Mentira 1: Execuções Perfeitas
A maioria dos motores assume que sua ordem é executada exatamente pelo preço que você vê. Na realidade:
- Ordens a mercado são executadas pela oferta (compra) ou pela demanda (venda), não pelo preço médio
- Ordens grandes movimentam o mercado (derrapagem)
- Durante a volatilidade, as execuções podem ser de 5 a 10 ticks piores do que o esperado

Meu motor modela isso:
