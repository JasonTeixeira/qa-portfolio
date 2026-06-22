---
title: "Tratamento de Erros Que Respeita Seus Usuários"
excerpt: "Seus usuários não se importam com rastreamentos de pilha. Eles se importam com o que deu errado e o que fazer a seguir. Veja como eu projeto experiências de erro que ajudam em vez de frustrar."
sourceSlug: error-handling-that-respects-your-users
locale: pt
sourceHash: 68295447e196c20c
machineTranslated: true
---

# Tratamento de Erros Que Respeita Seus Usuários

A maioria dos tratamentos de erros é escrita para o engenheiro que já conhece o sistema.

Isso é ao contrário.

O usuário não se importa que um webhook do Stripe expirou, que uma política do Supabase rejeitou a linha ou que um provedor de modelo retornou um 429. Eles se importam com três coisas:

- o que aconteceu
- se o trabalho deles está seguro
- o que podem fazer a seguir

Se a interface não consegue responder a essas perguntas, a mensagem de erro não está ajudando. Ela está apenas vazando detalhes de implementação.

:::proof-note title="O padrão que uso" label="regra do operador"
Um estado de erro faz parte da superfície do produto. Ele deve ser projetado com o mesmo cuidado que o caminho feliz, pois é frequentemente o momento em que a confiança é protegida ou perdida.
:::

## Comece pela tarefa do usuário, não pela exceção

O primeiro rascunho de uma mensagem de erro geralmente soa como o caminho do código:

> Falha ao criar sessão de checkout.

Isso pode ser verdade, mas não é útil. Uma versão melhor começa com a intenção do usuário:

> Não foi possível abrir o checkout. Os detalhes do seu projeto foram salvos. Tente novamente ou agende uma chamada e finalizaremos manualmente.

Essa mensagem faz quatro tarefas:

- nomeia a ação que falhou
- confirma se os dados foram salvos
- dá um próximo passo
- evita culpar o usuário

O erro interno ainda pode ser registrado com o provedor, código de status, ID da requisição e stack trace. O usuário não precisa de tudo isso.

## Separe o texto do usuário da telemetria de engenharia

A superfície do produto e a superfície de observabilidade não devem carregar a mesma carga.

:::system-diagram title="Fluxo de erro respeitoso" label="superfície -> telemetria" nodes="Ação do usuário, Limite de erro, Texto do usuário, Telemetria"
O usuário vê um caminho de recuperação claro. O sistema mantém o stack trace, ID da requisição, resposta do provedor e roteamento de alertas para o operador.
:::

Em produção, quero duas saídas da mesma falha:

- uma mensagem legível para humanos na página
- um evento legível por máquina em logs, análises e alertas

O texto do usuário deve ser calmo e específico. A telemetria pode ser densa e feia, se necessário. Misturar esses dois cria logs inúteis ou interfaces hostis.

## Bons estados de erro respondem a cinco perguntas

Quando reviso um estado de erro, passo por esta lista de verificação.

:::checklist title="Lista de verificação de estado de erro" label="qa de ux"
- Diz qual ação falhou?
- Diz se os dados do usuário estão seguros?
- Oferece um próximo passo realista?
- Evita expor segredos, stack traces ou detalhes internos do provedor?
- A telemetria captura detalhes suficientes para o operador depurar?
:::

Se a resposta for não, o estado não está pronto.

Por exemplo, uma falha no formulário de lead não deve dizer `500 Erro Interno do Servidor`. Deve dizer algo como:

> Não foi possível enviar a mensagem. Seu navegador permaneceu nesta página, então nada foi perdido. Tente novamente ou envie os detalhes do projeto por e-mail diretamente.

Então os logs do servidor devem carregar a causa real: falha de validação, timeout do Resend, falha de inserção no Supabase ou rejeição de webhook.

## Projete a alternativa antes da falha do sistema

Equipes geralmente adicionam estados alternativos após o primeiro incidente em produção. Isso é caro porque a falha já é pública.

Para fluxos importantes, gosto de definir a alternativa enquanto construo a funcionalidade:

| Fluxo | Alternativa do usuário | Sinal do operador |
|---|---|---|
| Checkout | Rota de salvamento, oferecer link de agendamento | erro do provedor de pagamento com metadados da sessão |
| Formulário de contato | Manter mensagem na tela, mostrar e-mail direto | erro de captura de lead com origem e formato da carga |
| Geração de IA | Preservar prompt, oferecer nova tentativa | provedor, modelo, latência e metadados de token |
| Upload de arquivo | Mostrar limite de arquivo e caminho de nova tentativa | erro de armazenamento, tamanho, tipo MIME, ID da organização |

A alternativa não precisa ser sofisticada. Precisa preservar o momentum.

## Não faça todo erro soar igual

Mensagens genéricas fazem o produto parecer descuidado:

- Algo deu errado.
- Tente novamente mais tarde.
- Ocorreu um erro inesperado.

Às vezes, essas são aceitáveis como capturas finais, mas não devem ser a única linguagem de erro no produto.

Falhas diferentes precisam de caminhos de recuperação diferentes:

- erro de validação: mostre o campo exato e o formato esperado
- erro de permissão: explique qual função ou conta é necessária
- limite de taxa: diga quando tentar novamente ou ofereça uma ação mais leve
- falha de dependência: preserve o trabalho do usuário e mostre um caminho alternativo
- falha de ação destrutiva: declare claramente o que não mudou

O objetivo não é fazer o sistema parecer perfeito. O objetivo é fazer o usuário se sentir orientado quando ele não está.

:::scorecard title="Qualidade do texto de erro" label="placar"
Padrão | Fraco | Forte
Validação | Entrada inválida | Use um e-mail profissional ou remova caracteres não suportados
Falha do provedor | Checkout falhou | O checkout não abriu. Os detalhes do seu projeto estão salvos.
Permissão | Não autorizado | Você precisa de acesso de administrador para alterar configurações de faturamento
Limite de taxa | Muitas requisições | Aguarde 60 segundos antes de executar outra auditoria
Desconhecido | Algo deu errado | Não foi possível concluir esta ação. Seu rascunho ainda está aqui.
:::

## O operador precisa de uma interface diferente

Um texto respeitoso voltado ao usuário só funciona se o operador ainda receber as evidências reais.

Isso significa registrar:

- rota e ação
- ID da requisição ou trace ID
- ID do usuário/organização quando disponível
- provedor e código de status
- formato seguro da carga
- tempo
- contagem de novas tentativas

Também significa não registrar segredos, tokens brutos, detalhes de cartão de pagamento, documentos privados ou prompts completos quando esses prompts podem conter dados do cliente.

Um bom tratamento de erros não é um registro mais suave. É uma separação mais nítida.

## O padrão que tento entregar

Para cada ação importante, quero esta forma:

1. Validar cedo e mostrar orientação no nível do campo.
2. Encapsular a ação do servidor/rota da API em tratamento de erros estruturado.
3. Retornar uma mensagem de usuário estável e um código de máquina estável.
4. Registrar o contexto completo seguro para o operador.
5. Rastrear a falha como um evento de produto se ela afetar a conversão.
6. Preservar a entrada do usuário sempre que possível.

Isso não é um trabalho glamouroso, mas faz parte da sensação premium. O site que salva seu trabalho e diz o que fazer a seguir parece mais confiável do que o site que pisca uma caixa vermelha e faz você recomeçar.

:::offer-cta title="Quer os caminhos de falha auditados?" label="próximo passo" href="/tools/route-finder" cta="Encontre sua rota"
Use o Route Finder para decidir se seu produto precisa de uma construção de estúdio, um sprint de auditoria, um escopo de automação ou um caminho de academia.
:::
