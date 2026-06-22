---
title: "Monólito vs Microsserviços: Por que escolhi um monólito modular para a Nexural"
excerpt: "A plataforma Nexural tem 7 sistemas, mas funciona como um monólito modular, não como microsserviços. Veja por que essa foi a decisão certa para um engenheiro solo e quando eu dividiria."
sourceSlug: monolith-vs-microservices-why-i-chose-a-modular-monolith-for-nexural
locale: pt
sourceHash: bbc8c35698d66e27
machineTranslated: true
---

# Monólito vs Microsserviços: Por Que Escolhi um Monólito Modular para a Nexural

O ecossistema Nexural possui 7 sistemas interconectados: painel de trading, bot do Discord, mecanismo de pesquisa, sistema de alertas, estúdio de newsletter, rastreador de estratégias e suíte de automação.

Seria natural supor que se trata de uma arquitetura de microsserviços. Não é. É um monólito modular — e isso foi intencional.

## A Estrutura de Decisão

Fiz três perguntas:

1. **Quantos engenheiros?** Um (eu). Microsserviços multiplicam a sobrecarga operacional. Com um único engenheiro, cada novo serviço significa outro pipeline de deploy, outra configuração de monitoramento, outro modo de falha para depurar às 2h da manhã.

2. **Os módulos precisam de escalonamento independente?** Ainda não. O painel de trading e o mecanismo de pesquisa rodam ambos na Vercel. Eles não têm perfis de escalonamento diferentes que justifiquem infraestrutura separada.

3. **Os módulos precisam de stacks tecnológicas diferentes?** Parcialmente — o bot do Discord é Node.js, o sistema de alertas é .NET. Esses são serviços separados por necessidade. Mas os web apps são todos Next.js/TypeScript e compartilham tipos, utilitários e acesso ao banco de dados.

## O Que "Monólito Modular" Significa na Prática

A base de código está organizada como um único repositório com limites de domínio claros:

\
