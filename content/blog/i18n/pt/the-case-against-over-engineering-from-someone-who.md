---
title: "O Caso Contra a Engenharia Excessiva (De Alguém Que Já Fez Isso)"
excerpt: "Certa vez, construí uma arquitetura de plugins para um sistema que nunca precisou deles. 3 semanas de camadas de abstração para um recurso que ninguém pediu. Aqui está como aprendi a parar."
sourceSlug: the-case-against-over-engineering-from-someone-who
locale: pt
machineTranslated: true
---

# O Caso Contra o Excesso de Engenharia (De Alguém Que Já Fez Isso)

Tenho uma confissão. Em 2023, passei três semanas construindo um sistema de plugins para um framework de automação de testes. Executores de teste configuráveis. Plugins com recarregamento a quente. Um contêiner de injeção de dependência. A obra completa.

Ninguém nunca escreveu um plugin.

O framework rodava no CI com a mesma configuração todas as vezes. A "extensibilidade" que construí foi usada por exatamente zero pessoas. Eu poderia ter entregue tudo em 4 dias sem a arquitetura de plugins.

## Como o Excesso de Engenharia Acontece

Tudo começa com um pensamento razoável: "E se precisarmos estender isso depois?"

Esse pensamento é a armadilha. Porque "depois" raramente se parece com o que você imaginou, e as abstrações que você constrói para requisitos imaginários geralmente atrapalham os reais.

Aqui está a progressão que observei em mim mesmo:

1. Construir uma função simples ✅
2. Pensar "isso deveria ser configurável" ⚠️
3. Adicionar um objeto de configuração
4. Pensar "ambientes diferentes podem precisar de implementações diferentes" ⚠️
5. Adicionar uma interface e o padrão factory
6. Pensar "podemos precisar trocar isso em tempo de execução" 🚩
7. Adicionar injeção de dependência
8. Perceber que ninguém nunca precisou trocar
9. Manter a abstração para sempre porque removê-la é mais difícil que mantê-la

## As Três Perguntas

Antes de adicionar qualquer abstração, agora eu pergunto:

**1. "Alguém realmente pediu isso?"**

Se a resposta for "não, mas talvez peçam" — não construa. YAGNI (You Aren't Gonna Need It) é o princípio mais violado na engenharia.

**2. "Qual é o custo de adicionar isso depois versus agora?"**

Se eu puder adicionar a abstração em 2 horas quando ela for realmente necessária, não há motivo para construí-la agora "só por precaução." O custo da abstração prematura (manter código que ninguém usa) é quase sempre maior que o custo de adicioná-la depois.

**3. "Consigo explicar por que isso existe para alguém em uma frase?"**

"Usamos injeção de dependência porque precisamos trocar o provedor de pagamento entre Stripe e Braintree em ambientes diferentes." Essa é uma razão real.

"Usamos injeção de dependência porque é uma boa prática." Isso não é uma razão. Isso é seguir cegamente o que outros fazem.

## Como É o Código Simples

\\\
