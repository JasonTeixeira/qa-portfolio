---
title: "Corrigindo Erros de Conexão do Docker Compose em CI/CD"
excerpt: "Passei 4 horas depurando erros de 'Conexão recusada' no Jenkins. Aqui está o que aprendi sobre redes Docker em pipelines de CI."
sourceSlug: fixing-docker-compose-connection-errors-in-ci-cd
locale: pt
sourceHash: 8e0431f892a3afac
machineTranslated: true
---

# Corrigindo Erros de Conexão do Docker Compose em CI/CD

Imagine: sua configuração do Docker Compose funciona perfeitamente na sua máquina local. Você envia para CI e, de repente, todos os testes de integração falham com `Connection refused`.

O contêiner do banco de dados está "rodando". O contêiner da API está "saudável". O processo de teste inicia. Então ele não consegue se conectar ao serviço necessário.

Essa falha parece aleatória até você lembrar de uma coisa: a rede Docker local e a rede Docker de CI não são o mesmo ambiente.

:::proof-note title="A verdadeira lição" label="nota ci"
A maioria dos erros de conexão do Docker Compose em CI não são problemas do Docker. São problemas de tempo, hostname, porta ou limite de rede que o desenvolvimento local esconde.
:::

## A configuração local te engana

Na sua máquina, você pode se conectar ao Postgres em `localhost:5432`.

Dentro de uma rede do Compose, outro contêiner geralmente deve se conectar a `postgres:5432`, onde `postgres` é o nome do serviço.

Em CI, o executor de testes pode estar:

- dentro da rede do Compose
- fora da rede do Compose no host
- dentro de um contêiner de serviço de CI
- dentro de um executor Docker aninhado

Esses quatro casos usam hostnames diferentes.

É por isso que uma string de conexão pode estar "correta" localmente e errada no pipeline.

## Primeiro, identifique onde o processo de teste roda

Antes de alterar portas, faça uma pergunta:

> O comando de teste está rodando dentro de um serviço do Compose ou no host de CI?

Se os testes rodam dentro do Compose:

```txt
DATABASE_URL=postgres://user:pass@postgres:5432/app
```

Se os testes rodam no host de CI e o Compose publicou a porta:

```txt
DATABASE_URL=postgres://user:pass@127.0.0.1:5432/app
```

Se os testes rodam em um contêiner de CI separado, nenhum dos dois pode funcionar até que a rede de serviços da plataforma de CI seja configurada.

:::system-diagram title="Decisão de rede de CI" label="compose -> testes" nodes="Serviço Compose,Rede,Executor de testes,Banco de dados"
O hostname correto depende de onde o executor de testes está. Nomes de serviço funcionam dentro da rede do Compose. Portas publicadas em localhost funcionam a partir do host.
:::

## Não confie em `depends_on` como prontidão

`depends_on` pode controlar a ordem de inicialização. Ele não garante que Postgres, Redis ou seu aplicativo esteja pronto para aceitar conexões.

A versão ruim comum:

```yaml
services:
  api:
    depends_on:
      - postgres
```

Isso significa apenas que o contêiner `postgres` inicia antes de `api`. Não significa que as migrações rodaram. Não significa que TCP está pronto. Não significa que o banco de dados aceitou autenticação.

Use health checks ou um script de espera explícito.

```yaml
services:
  postgres:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 12

  api:
    depends_on:
      postgres:
        condition: service_healthy
```

Isso ainda não resolve todas as plataformas de CI, mas remove a condição de corrida mais comum.

## Verifique as quatro classes de falha

Quando vejo `Connection refused`, trabalho nesta ordem.

:::checklist title="Checklist de CI do Docker Compose" label="ordem de depuração"
- Confirme a localização do executor de testes: host, serviço Compose ou contêiner de serviço de CI
- Confirme o hostname: nome do serviço vs 127.0.0.1 vs alias de serviço da plataforma
- Confirme que a porta publicada está realmente mapeada
- Confirme que a dependência está saudável antes dos testes iniciarem
- Imprima as variáveis de ambiente resolvidas em CI sem vazar segredos
- Execute uma pequena verificação TCP antes da suíte de testes completa
:::

A verificação TCP é simples, mas útil:

```bash
node -e "require('net').connect(5432, process.env.DB_HOST).on('connect', () => { console.log('ok'); process.exit(0) }).on('error', e => { console.error(e.message); process.exit(1) })"
```

Se isso falhar, sua suíte de testes do aplicativo não é o que deve ser depurado ainda.

## Use strings de conexão diferentes para limites diferentes

Um padrão limpo é tornar o limite explícito:

```env
DATABASE_URL_INTERNAL=postgres://app:app@postgres:5432/app
DATABASE_URL_HOST=postgres://app:app@127.0.0.1:5432/app
```

Então seu job de CI escolhe a correta com base em onde o comando roda.

Isso é menos mágico do que tentar fazer uma URL funcionar em todos os lugares.

:::scorecard title="Verificação de sanidade da string de conexão" label="scorecard"
Localização do executor | Hostname | Fonte da porta
Dentro do Compose | postgres | Porta do contêiner
Host de CI | 127.0.0.1 | Porta publicada
Contêiner de serviço de CI | Alias do serviço | Configuração do serviço da plataforma
Banco remoto | Host do banco público/privado | Lista de permissões de rede
:::

## Mantenha migrações separadas da prontidão

Um banco de dados pode estar saudável antes do esquema estar pronto.

Se seu aplicativo precisa de migrações, torne isso uma etapa explícita do pipeline:

```bash
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm test
```

Ou execute testes dentro de um serviço que aguarda ambos:

- saúde do banco de dados
- migrações concluídas
- dados de seed carregados

Caso contrário, você obtém uma classe pior de falha: erros de teste intermitentes que parecem bugs do aplicativo, mas são na verdade condições de corrida de configuração.

## A saída de depuração que quero em toda falha de CI

Não despeje segredos. Imprima a forma do ambiente.

Saída útil:

- Serviços do Docker Compose e status
- logs do contêiner para a dependência
- host e porta resolvidos, com senha oculta
- nomes de rede
- status do health-check
- status da migração

Exemplo:

```bash
docker compose ps
docker compose logs --tail=80 postgres
docker network ls
```

O objetivo é tornar a próxima falha diagnosticável em uma única passagem.

## A lição de produção

A dor de rede de CI é uma prévia da dor de integração em produção.

Se seus testes dependem de esperança, suas implantações provavelmente também. Torne os limites de serviço explícitos. Adicione health checks. Separe prontidão de migrações. Registre os fatos corretos.

É assim que você transforma "funciona na minha máquina" em algo que um pipeline pode provar.

:::offer-cta title="Precisa limpar o pipeline?" label="próximo passo" href="/tools/route-finder" cta="Encontre sua rota"
Use o diagnóstico para decidir se isso é um sprint de auditoria focado, uma construção de plataforma ou um caminho de academia que você pode percorrer sozinho.
:::
