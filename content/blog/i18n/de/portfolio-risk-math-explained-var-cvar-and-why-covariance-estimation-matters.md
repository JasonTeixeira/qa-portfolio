---
title: "Portfolio-Risiko-Mathematik erklärt: VaR, CVaR und warum die Kovarianzschätzung wichtig ist"
excerpt: "Die Mathematik hinter RiskRadar – Value at Risk, Conditional VaR, Ledoit-Wolf-Schätzung und Monte-Carlo-Simulation, erklärt für Ingenieure, die keine Quants sind."
sourceSlug: portfolio-risk-math-explained-var-cvar-and-why-covariance-estimation-matters
locale: de
sourceHash: 50a489ee66c8215e
machineTranslated: true
---

# Portfolio-Risiko-Mathematik erklärt: VaR, CVaR und warum die Kovarianzschätzung wichtig ist

Als ich RiskRadar entwickelte, musste ich institutionelle Risikoberechnungen implementieren. Die meisten Tutorials zum Risikomanagement vereinfachen entweder zu sehr („Berechne einfach die Standardabweichung“) oder setzen Mathematik auf PhD-Niveau voraus.

Hier ist der Mittelweg – die Mathematik, die Sie tatsächlich für die Berechnung von Portfolio-Risiken benötigen, erklärt für Ingenieure.

## Value at Risk (VaR): Was ist das Schlimmste, was passieren könnte?

VaR beantwortet die Frage: „Was ist der maximale Verlust, den ich an einem Tag mit 95%iger Konfidenz erleiden könnte?“

Wenn Ihr 1-Tages-95%-VaR 10.000 $ beträgt, bedeutet das: An 95% der Tage werden Ihre Verluste 10.000 $ nicht überschreiten. An den anderen 5% der Tage... könnten sie es.

**Drei Methoden zur Berechnung des VaR:**

### Historischer VaR (am einfachsten)
Sortieren Sie Ihre historischen Tagesrenditen. Das 5. Perzentil ist Ihr 95%-VaR.
