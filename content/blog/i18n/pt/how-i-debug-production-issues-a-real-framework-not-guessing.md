---
title: "Como Depuro Problemas em Produção (Um Framework Real, Não Palpites)"
excerpt: "A maioria dos desenvolvedores depura alterando coisas até o erro desaparecer. Eu depuro estreitando o raio de explosão sistematicamente. Aqui está meu framework real."
sourceSlug: how-i-debug-production-issues-a-real-framework-not-guessing
locale: pt
machineTranslated: true
---

# Como Depuro Problemas em Produção (Um Framework Real, Não Achismo)

No início da minha carreira, eu depurava no feeling. Algo quebrava, eu olhava para o código, mudava alguma coisa, reimplantava, torcia. Às vezes funcionava. Frequentemente, piorava as coisas.

Quando você está construindo sistemas dos quais as pessoas dependem, você não pode se dar ao luxo de adivinhar. Desenvolvi um framework para depurar de forma sistemática. Não é glamoroso, mas funciona todas as vezes.

## O Framework: ISOLATE

**I** — Identifique o sintoma (não a causa)
**S** — Escopo do raio de alcance (blast radius)
**O** — Observe os dados (logs, métricas, traces)
**L** — Liste hipóteses (mínimo 3)
**A** — Avalie cada hipótese com evidências
**T** — Teste a correção de forma isolada
**E** — Explique o que aconteceu (postmortem)

Deixe-me mostrar um exemplo real.

## Caso Real: Dashboard Carregando em 30 Segundos

**I — Identifique o sintoma.**
Usuários relatam que o dashboard de qualidade leva 30+ segundos para carregar. Localmente, carrega em 2 segundos. Apenas em produção.

Não pule para "é um problema de banco de dados" ou "é um problema de rede" ainda. Apenas descreva o que você vê.

**S — Escopo do raio de alcance.**
São todos os usuários ou específicos? Todos os navegadores? Quando começou? Correlacionado com um deploy?

Neste caso: todos os usuários, começou há 3 dias, nenhum deploy nessa janela. Isso elimina "enviamos código quebrado" como causa.

**O — Observe os dados.**

\\\
