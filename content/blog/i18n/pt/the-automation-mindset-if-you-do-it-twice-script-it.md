---
title: "A Mentalidade da Automação: Se Você Fizer Duas Vezes, Crie um Script"
excerpt: "Tenho 47 scripts de shell, 6 fluxos de CI e um cron job que me envia SMS quando meu certificado SSL está expirando. Aqui está a mentalidade por trás de automatizar tudo."
sourceSlug: the-automation-mindset-if-you-do-it-twice-script-it
locale: pt
machineTranslated: true
---

# A Mentalidade da Automação: Se Você Fizer Duas Vezes, Crie um Script

Na terça-feira passada, executei uma migração de banco de dados, testei 3 endpoints de API, verifiquei os logs do webhook do Stripe, confirmei que o pipeline de CI estava verde e fiz o deploy para produção. Tempo total: 4 minutos.

Antes, isso costumava levar 45.

A diferença não é que fiquei mais rápido em clicar em botões. É que parei de clicar em botões completamente.

## A Regra

**Se eu fizer algo manualmente duas vezes, automatizo na terceira.**

Não "quando tiver tempo." Não "na próxima sprint." Na terceira vez. Porque a quarta vez está chegando, e a quinta, e a centésima.

## Minha Stack de Automação

### Script de Deploy (substituiu 12 etapas manuais)

\\\
