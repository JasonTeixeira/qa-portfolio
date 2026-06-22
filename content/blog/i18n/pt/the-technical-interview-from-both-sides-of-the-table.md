---
title: "A Entrevista Técnica de Ambos os Lados da Mesa"
excerpt: "Já fui o candidato suando em questões de design de sistemas e o entrevistador avaliando-as. A lacuna entre o que os entrevistadores procuram e o que os candidatos preparam é enorme."
sourceSlug: the-technical-interview-from-both-sides-of-the-table
locale: pt
machineTranslated: true
---

# A Entrevista Técnica de Ambos os Lados da Mesa

Já sentei em ambos os lados. Já desenhei arquiteturas de sistemas no quadro branco enquanto um entrevistador acenava silenciosamente. Também já fui eu a acenar, observando um candidato projetar um sistema de notificações no quadro branco.

A diferença entre o que os candidatos preparam e o que os entrevistadores realmente avaliam é impressionante.

## O Que os Candidatos Preparam

- Problemas difíceis do LeetCode
- Perguntas sobre algoritmos obscuros
- "Conte-me sobre uma ocasião em que..."
- Respostas decoradas de design de sistemas

## O Que os Entrevistadores Realmente Avaliam

- **Como você lida com ambiguidade.** A primeira coisa que faço ao receber um problema de design de sistemas é fazer perguntas esclarecedoras. "Quantos usuários? Qual o requisito de latência? Qual o orçamento?" Candidatos que começam a desenhar caixas antes de fazer perguntas são um sinal de alerta. Eles constroem sem entender os requisitos — e farão o mesmo no trabalho.

- **Consciência de trade-offs.** Não existe arquitetura perfeita. Toda escolha tem um custo. Quando um candidato diz "devemos usar Kafka para a fila de mensagens", pergunto "por que não SQS?" Se eles conseguirem articular o trade-off (Kafka: maior throughput, mais sobrecarga operacional, melhor replay; SQS: mais simples, gerenciado, bom o suficiente para a maioria dos casos), eles entendem engenharia. Se disserem "Kafka é padrão da indústria", estão seguindo cegamente.

- **Pensamento em modos de falha.** "O que acontece quando este serviço cai?" Se a resposta for "não vai cair", sei que nunca operaram um sistema em produção. Tudo cai. A questão é se você projetou para isso.

- **Clareza de comunicação.** Você consegue explicar seu design para uma pessoa não técnica na sala? Cargos seniores envolvem comunicação com gerentes de produto, designers e executivos. Se você só consegue explicar seu sistema para outros engenheiros, atingiu seu teto.

## As Perguntas Que Faço (e o Que Realmente Estou Testando)

**"Conte-me sobre um projeto recente do qual você se orgulha."**

Estou testando: Você consegue contar uma história coerente? Você menciona restrições, não apenas tecnologia? Você dá crédito à sua equipe ou assume todo o crédito? Você menciona o que faria diferente?

**"Você está recebendo erros 500 em produção. Conte-me seu processo de depuração."**

Estou testando: Você tem uma abordagem sistemática ou você chuta? Você verifica logs e métricas primeiro ou começa a alterar código? Você pensa no raio de impacto?

**"Projete um sistema para [X]. Você tem 45 minutos."**

Estou testando: Você faz perguntas primeiro? Você começa com requisitos ou com tecnologia? Você menciona monitoramento, tratamento de erros e escalabilidade — ou apenas o caminho feliz?

## O Que Mudou Quando Comecei a Entrevistar

Como candidato, achava que o entrevistador queria a "resposta certa". Como entrevistador, aprendi que não existe resposta certa. Estou avaliando seu processo de pensamento.

O candidato que projeta um sistema simples, reconhece suas limitações e explica quando adicionaria complexidade é mais forte do que o candidato que projeta um sistema complexo que não consegue explicar.

## Meu Conselho (de Ambos os Lados)

**Para candidatos:**
1. Faça 3-5 perguntas esclarecedoras antes de projetar qualquer coisa
2. Comece simples e adicione complexidade quando solicitado
3. Mencione modos de falha sem ser perguntado ("se este serviço cair, aqui está o que acontece")
4. Explique trade-offs para cada decisão importante
5. Seja honesto sobre o que você não sabe — "não usei Kafka em escala, mas entendo os benefícios de throughput. Para este caso de uso, começaria com SQS e migraria se precisássemos de replay"

**Para entrevistadores:**
1. Não teste conhecimento específico de tecnologia — teste julgamento de engenharia
2. Pergunte "o que você faria diferente?" — os melhores engenheiros têm opiniões fortes sobre seu próprio trabalho
3. Dê espaço para os candidatos se recuperarem de erros — como eles lidam com estar errados diz mais do que acertar

As melhores entrevistas parecem sessões de trabalho. As piores parecem interrogatórios. Projete para as primeiras.
