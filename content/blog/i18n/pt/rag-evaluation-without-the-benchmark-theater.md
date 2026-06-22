---
title: "Avaliação de RAG Sem o Teatro de Benchmarks"
excerpt: "Uma forma fundamentada de avaliar geração aumentada por recuperação: cobertura de fontes, fidelidade de citações, comportamento de recusa e utilidade em nível de tarefa."
sourceSlug: rag-evaluation-without-the-benchmark-theater
locale: pt
sourceHash: 0c9b12c23086a8ae
machineTranslated: true
---

# Avaliação de RAG Sem o Teatro de Benchmarks

A primeira demo de RAG sempre funciona.

Você carrega o PDF limpo. Faz a pergunta óbvia. O modelo encontra o parágrafo óbvio e responde no tom de um consultor bem financiado.

Então um usuário faz a pergunta com a sigla errada, a política mudou há três semanas, a resposta está espalhada por dois documentos, e o sistema cita um parágrafo que parece relacionado, mas na verdade não sustenta a afirmação.

É aí que o produto começa.

## A recuperação é a primeira decisão de produto

A qualidade do RAG começa antes de o modelo ver qualquer coisa.

A camada de recuperação decide o que o modelo tem permissão para saber. Se os trechos errados voltarem, a resposta já está comprometida. Um prompt melhor pode esconder o problema. Não vai corrigi-lo.

Eu avalio a recuperação com perguntas simples:

- O documento certo apareceu nos primeiros resultados?
- A seção certa apareceu, não apenas o arquivo certo?
- Material mais novo superou material mais antigo?
- A consulta funcionou quando formulada como um usuário real a formularia?
- O sistema retornou nada quando nada era a resposta honesta?

Esse último ponto é importante. Um sistema de busca que sempre retorna algo ensina o modelo a sempre dizer algo.

## Fidelidade da citação supera confiança na resposta

A resposta não é suficiente.

Para qualquer sistema de conhecimento, quero saber se a fonte citada realmente sustenta a frase que está sendo afirmada.

Isso significa avaliar no nível da afirmação, não apenas no nível da resposta. Se a resposta tem quatro afirmações e apenas duas são sustentadas, a resposta não é "quase correta". Ela é perigosa de uma forma que parece polida.

Uma rubrica simples funciona:

- Sustentada: a citação prova diretamente a afirmação.
- Parcial: a citação está relacionada, mas não prova completamente a afirmação.
- Não sustentada: a citação não prova a afirmação.
- Contradita: a citação diz o oposto.

Você não precisa de um benchmark elaborado para começar. Você precisa de 30 perguntas reais e da disciplina para marcar os erros honestamente.

## Recusa é uma funcionalidade

Sistemas de RAG precisam saber quando não responder.

Isso significa testar perguntas onde o corpus não contém a resposta. Também significa testar perguntas onde a resposta é sensível, desatualizada ou depende de contexto que o usuário não forneceu.

Um bom comportamento de recusa soa como:

"Não vejo isso nas fontes disponíveis. O documento mais próximo relacionado é X, mas ele não responde à pergunta diretamente."

Um mau comportamento de recusa soa como:

"Com base nas informações disponíveis, parece que..."

Essa frase é onde as alucinações vestem um paletó.

## O placar útil

Para um sistema de RAG interno, prefiro acompanhar cinco métricas fundamentadas do que uma pontuação de benchmark impressionante:

1. Taxa de acerto da recuperação: a fonte certa apareceu?
2. Fidelidade da citação: a fonte sustentou a resposta?
3. Precisão da recusa: o sistema recusou perguntas não sustentadas?
4. Utilidade da resposta: o usuário conseguiu dar o próximo passo?
5. Distância de edição: quanto um humano precisou alterar?

A última métrica é a mais honesta. Se os usuários continuam reescrevendo a resposta, o sistema não está economizando tempo deles. Está criando um rascunho educado que eles precisam supervisionar.

## Comece pequeno o suficiente para medir

O primeiro sistema de RAG certo geralmente não é o "cérebro da empresa".

É um corpus, um fluxo de trabalho, um tipo de usuário e uma ação clara após a resposta. Macros de suporte. Capacitação de vendas. Consulta de políticas. Documentos internos de engenharia. Busca de cláusulas contratuais.

Escopo estreito torna a avaliação possível.

A avaliação torna a confiança possível.

A confiança torna a expansão possível.

Essa ordem importa.
