---
title: "Matemática de Risco de Portfólio Explicada: VaR, CVaR e Por que a Estimação de Covariância Importa"
excerpt: "A matemática por trás do RiskRadar — Valor em Risco, CVaR, shrinkage de Ledoit-Wolf e simulação de Monte Carlo explicada para engenheiros que não são quants."
sourceSlug: portfolio-risk-math-explained-var-cvar-and-why-covariance-estimation-matters
locale: pt
machineTranslated: true
---

# Explicação da Matemática de Risco de Portfólio: VaR, CVaR e Por que a Estimativa de Covariância é Importante

Quando construí o RiskRadar, precisei implementar cálculos de risco de nível institucional. A maioria dos tutoriais de gerenciamento de risco ou simplifica demais ("basta calcular o desvio padrão") ou assume conhecimento de matemática de doutorado.

Aqui está o meio-termo — a matemática que você realmente precisa para implementar risco de portfólio, explicada para engenheiros.

## Value at Risk (VaR): Qual é o Pior que Pode Acontecer?

O VaR responde: "Qual é o máximo que posso perder em um dia, com 95% de confiança?"

Se o VaR de 1 dia com 95% de confiança do seu portfólio é $10.000, isso significa que: em 95% dos dias, suas perdas não excederão $10.000. Nos outros 5% dos dias... elas podem.

**Três formas de calcular o VaR:**

### VaR Histórico (mais simples)
Ordene seus retornos diários históricos. O 5º percentil é o seu VaR de 95%.
