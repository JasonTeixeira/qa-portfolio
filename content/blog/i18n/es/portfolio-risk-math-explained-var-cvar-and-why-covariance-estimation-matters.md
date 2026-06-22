---
title: "Matemáticas de Riesgo de Cartera Explicadas: VaR, CVaR y por qué la Estimación de Covarianza es Importante"
excerpt: "Las matemáticas detrás de RiskRadar — Valor en Riesgo, CVaR, contracción de Ledoit-Wolf y simulación Monte Carlo explicadas para ingenieros que no son cuantitativos."
sourceSlug: portfolio-risk-math-explained-var-cvar-and-why-covariance-estimation-matters
locale: es
sourceHash: 50a489ee66c8215e
machineTranslated: true
---

# Explicación de las Matemáticas de Riesgo de Portafolio: VaR, CVaR y por qué la Estimación de Covarianza Importa

Cuando construí RiskRadar, necesitaba implementar cálculos de riesgo de nivel institucional. La mayoría de los tutoriales de gestión de riesgo o simplifican demasiado ("solo calcula la desviación estándar") o asumen matemáticas de nivel doctorado.

Aquí está el punto medio — las matemáticas que realmente necesitas para implementar riesgo de portafolio, explicadas para ingenieros.

## Valor en Riesgo (VaR): ¿Qué es lo Peor que Podría Pasar?

VaR responde: "¿Cuál es la pérdida máxima que podría tener en un día, con un 95% de confianza?"

Si el VaR al 95% a 1 día de tu portafolio es $10,000, eso significa que: en el 95% de los días, tus pérdidas no superarán los $10,000. En el otro 5% de los días... podrían superarlo.

**Tres formas de calcular VaR:**

### VaR Histórico (el más simple)
Ordena tus rendimientos diarios históricos. El percentil 5 es tu VaR al 95%.
