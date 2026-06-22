---
title: "Seu Número de Cobertura de Testes Está Mentindo para Você"
excerpt: "80% de cobertura de testes não significa nada se você está testando os 80% errados. Aqui está como eu penso sobre cobertura — não como um número a perseguir, mas como um mapa de onde você está cego."
sourceSlug: your-test-coverage-number-is-lying-to-you
locale: pt
sourceHash: 3020cce909216922
machineTranslated: true
---

# Seu Número de Cobertura de Testes Está Mentindo para Você

Já vi bases de código com 95% de cobertura de testes que lançam bugs críticos semanalmente. Já vi bases de código com 40% de cobertura que raramente quebram.

O número não é o problema. A obsessão pelo número é.

## A Armadilha da Cobertura

Aqui está um teste que aumenta a cobertura, mas não captura nada:

\\\
