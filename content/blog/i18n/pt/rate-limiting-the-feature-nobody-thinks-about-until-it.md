---
title: "Limitação de Taxa: O Recurso em que Ninguém Pensa Até Ser Tarde Demais"
excerpt: "Sua API funciona perfeitamente a 10 requisições por segundo. A 10.000, ela cai. Veja como implemento limitação de taxa que protege sem irritar usuários legítimos."
sourceSlug: rate-limiting-the-feature-nobody-thinks-about-until-it
locale: pt
machineTranslated: true
---

# Limitação de Taxa: O Recurso em Que Ninguém Pensa Até Ser Tarde Demais

Ninguém coloca "implementar limitação de taxa" no quadro do sprint. Não é uma história de usuário. Não move uma métrica. O Product nunca pede por isso.

Então um dia, alguém cria um script com 50.000 requisições para sua API em 30 segundos e seu banco de dados derrete. Ou pior — um script descontrolado de um único usuário custa US$ 800 em invocações AWS Lambda durante a noite.

Ambas as situações aconteceram comigo. Agora a limitação de taxa está no meu template inicial.

## As Três Camadas

Implemento limitação de taxa em três camadas, porque cada uma captura padrões de abuso diferentes:

### Camada 1: Edge (CloudFront / Vercel)

\\\
