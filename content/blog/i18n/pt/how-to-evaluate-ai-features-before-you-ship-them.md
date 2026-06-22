---
title: "Como Avaliar Recursos de IA Antes de Lançá-los"
excerpt: "Um ciclo de avaliação prático para recursos de IA: defina a promessa, crie um conjunto de falhas, teste os casos comuns e mantenha um humano no ciclo até que o sistema ganhe confiança."
sourceSlug: how-to-evaluate-ai-features-before-you-ship-them
locale: pt
sourceHash: c309380851b58ed1
machineTranslated: true
---

# Como Avaliar Funcionalidades de IA Antes de Lançá-las

Uma funcionalidade de IA não está pronta quando funciona na demonstração.

Essa é a armadilha. Você faz três perguntas amigáveis, ela responde duas e meia, todos veem o formato do futuro, e de repente o roadmap do produto tem uma funcionalidade chamada "assistente de IA" no lugar onde deveria estar uma especificação.

Não confio nessa versão do processo. Confio na mais lenta: nomeie a promessa, escreva os casos de falha, teste o caminho tedioso e mantenha um humano por perto até que o sistema prove que pode se comportar.

:::system-diagram title="Ciclo de avaliação de IA" label="promessa -> prova" nodes="Promessa,Falhas,Revisão,Publicação"
A funcionalidade não é avaliada uma vez. Ela percorre um ciclo: defina a promessa, construa o conjunto de falhas, revise as saídas reais e só então decida o que pode ser lançado.
:::

## Comece pela promessa

A primeira pergunta não é "Qual modelo devemos usar?"

A primeira pergunta é: o que o usuário tem permissão para acreditar depois que esta funcionalidade responder?

Essa frase importa. Se a funcionalidade resume um documento, o usuário acredita que o resumo é fiel. Se ela redige uma resposta de suporte, o usuário acredita que não inventará uma política de reembolso. Se explica um sinal de negociação, o usuário acredita que não é um conselho financeiro disfarçado de tom amigável.

Escreva a promessa em uma linha:

- "Esta funcionalidade classifica a solicitação e a encaminha para o fluxo de trabalho correto."
- "Esta funcionalidade redige uma resposta que um humano aprova antes de enviar."
- "Esta funcionalidade pesquisa documentos internos e cita a fonte que usou."

Se a promessa ocupar um parágrafo, a funcionalidade ainda não está escopada.

## Construa o conjunto de falhas antes do caminho feliz

A maioria das demonstrações de IA é treinada acidentalmente para passar na demonstração.

O conjunto de avaliação real deve incluir as entradas que tornam o produto desconfortável:

- solicitações vagas
- instruções conflitantes
- contexto ausente
- injeção maliciosa de prompt
- documentos de políticas antigos
- registros duplicados
- mensagens de clientes com raiva
- casos extremos que custam dinheiro se mal tratados

Para um fluxo de trabalho de IA voltado ao cliente, quero pelo menos 25 exemplos antes de confiar no formato do sistema. Não 25 linhas de benchmark perfeitas. Vinte e cinco exemplos feios que representam o trabalho real.

O conjunto de avaliação não é papelada. É o limite do produto.

## Separe qualidade do modelo de qualidade do produto

Um modelo pode ser bom e o produto ainda assim ser ruim.

O modelo pode produzir uma resposta correta sem citação. O fluxo de trabalho pode citar o documento certo, mas enterrar o aviso importante. A interface pode fazer a resposta parecer definitiva quando é apenas um rascunho.

Eu pontuo funcionalidades de IA em camadas:

1. Entendeu a tarefa?
2. Usou a fonte ou ferramenta correta?
3. Evitou fazer afirmações fora da fonte?
4. Retornou o resultado em um formato que o usuário pode usar?
5. A interface deixou claros a confiança e os limites do sistema?

Apenas as duas primeiras são principalmente questões do modelo. O restante são questões do produto.

## Mantenha um humano no ciclo por mais tempo do que parece conveniente

A primeira versão em produção de um fluxo de trabalho de IA geralmente deve ser rascunho primeiro, não envio primeiro.

Isso soa menos mágico. Bom.

Rascunho primeiro fornece dados de revisão. Mostra onde os usuários editam a saída, onde a rejeitam, quais campos corrigem e quais tarefas nunca deveriam ter sido automatizadas em primeiro lugar.

A etapa de revisão humana não é uma muleta permanente. É instrumentação.

Quando as edições se tornam previsíveis, automatize a edição. Quando as rejeições se agrupam em torno de um tipo de entrada, mude o roteador. Quando o revisor continua verificando a mesma fonte manualmente, adicione recuperação e citação.

Você não remove o humano porque a demonstração funcionou. Você remove o humano quando o registro de revisão diz que o sistema mereceu.

## A lista de verificação para lançamento

Antes de lançar uma funcionalidade de IA, quero que estes itens estejam em vigor:

:::checklist title="Lista de verificação para lançamento de funcionalidade de IA" label="lista de verificação"
- Uma promessa de uma frase.
- Um conjunto de avaliação com exemplos feios.
- Critérios de aprovação/reprovação para cada exemplo.
- Registro de prompt, chamadas de ferramenta, fontes e resultado.
- Um caminho de revisão humana para saídas de alto risco.
- Uma alternativa quando o modelo estiver indisponível.
- Uma forma de relatar saída ruim pela interface.
:::

- uma promessa de uma frase
- um conjunto de avaliação com exemplos feios
- critérios de aprovação/reprovação para cada exemplo
- registro de prompt, chamadas de ferramenta, fontes e resultado
- um caminho de revisão humana para saídas de alto risco
- uma alternativa quando o modelo estiver indisponível
- uma forma de relatar saída ruim pela interface

Nada disso torna a funcionalidade menos impressionante.

Isso a torna real.

:::offer-cta title="Precisa de uma funcionalidade de IA avaliada antes do lançamento?" label="próximo passo" href="/tools/route-finder" cta="Encontre sua rota"
Use o Route Finder para decidir se isso precisa de uma auditoria de IA, escopo de automação, caminho de academia ou construção completa do produto.
:::

Sistema relacionado: [A auditoria de implementação de IA antes de construir](/blog/the-ai-implementation-audit-before-you-build) divide essa mesma ideia em um caminho de auditoria pré-construção para equipes decidindo o que automatizar primeiro.
