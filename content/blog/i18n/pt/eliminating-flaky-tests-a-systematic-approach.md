---
title: "Eliminando Testes Instáveis: Uma Abordagem Sistemática"
excerpt: "Como levei um conjunto de testes de uma taxa de instabilidade de 10% para menos de 1% — lógica de repetição, isolamento de testes, dados determinísticos e os padrões que tornam os testes confiáveis."
sourceSlug: eliminating-flaky-tests-a-systematic-approach
locale: pt
machineTranslated: true
---

# Eliminando Testes Flaky: Uma Abordagem Sistemática

Um teste flaky é um teste que às vezes passa e às vezes falha sem qualquer alteração no código. Com uma taxa de flaky de 10%, os desenvolvedores param de confiar no conjunto de testes. Com 20%, eles param de executá-lo.

Já reduzi conjuntos de testes de 10% de flaky para menos de 1%. Aqui está a abordagem sistemática.

## Passo 1: Meça a Taxa de Flaky

Você não pode corrigir o que não mede. Acompanhe a flakyness ao longo do tempo:
