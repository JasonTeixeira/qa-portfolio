---
title: "O que aprendi construindo em público como engenheiro solo"
excerpt: "Um ano construindo o ecossistema Nexural, negociando futuros, escrevendo um livro e documentando tudo. As vitórias, os fracassos e o que eu diria a alguém começando hoje."
sourceSlug: what-i-learned-building-in-public-as-a-solo-engineer
locale: pt
sourceHash: 8efdb4e4031bcb97
machineTranslated: true
---

# O que Aprendi Construindo em Público como Engenheiro Solo

Há um ano, saí do meu cargo na HighStrike e fundei a Sage Ideas LLC. Desde então, construí uma plataforma fintech com 185 tabelas de banco de dados, um bot para Discord com IA, um sistema de sinais de trading com ML, um livro de 120.000 palavras sobre trading e este site de portfólio.

Aqui está o que aprendi.

## A Solidão é Real

Engenharia solo significa:
- Sem revisões de código (você revisa seu próprio código)
- Sem discussões de arquitetura (você argumenta consigo mesmo)
- Ninguém para pegar seus pontos cegos (você os descobre em produção)
- Ninguém para comemorar vitórias (você faz push para a main e segue em frente)

A solução: comecei a documentar minhas decisões. Cada decisão importante de arquitetura ganha um arquivo markdown explicando o que escolhi e por quê. É uma conversa com meu eu futuro — e agora é conteúdo para meu portfólio.

## Envie Semanalmente, Não Mensalmente

Nos meus primeiros 3 meses, construí por 4 semanas antes de fazer deploy. Eu encontrava bugs, percebia que tinha construído a coisa errada e perdia dias refatorando.

Agora envio toda semana. Às vezes todo dia. Deploys pequenos significam:
- Menos risco por deploy
- Feedback mais rápido
- Rollbacks mais fáceis
- Progresso visível (crucial para motivação)

## O 80/20 da Engenharia Solo

**20% do trabalho que produz 80% do valor:**
- Design do esquema de banco de dados (acerte isso e tudo a jusante fica mais fácil)
- Definição do contrato da API (schemas Zod pegam 90% dos bugs de integração)
- Configuração de CI/CD (deploys automatizados = você entrega mais)
- Monitoramento de erros (saber dos bugs antes dos usuários reportá-los)

**80% do trabalho que produz 20% do valor:**
- UI pixel-perfect (usuários se importam com função, não com peso da fonte)
- Otimização de performance antes de ter usuários
- Escrever testes para código que vai mudar na semana que vem
- Escolher o stack tecnológico "perfeito"

## A Realidade Financeira

Sou um trader ativo de futuros. A renda do trading financia a construção. Isso é um luxo que a maioria dos builders solo não tem.

Sem a renda do trading, eu precisaria de:
- No mínimo 6 meses de economia
- Um caminho claro de monetização antes de construir
- Clientes pagantes antes de construir funcionalidades

Construir em público sem pressão de receita é um privilégio. Construir em público COM pressão de receita é empreendedorismo. Eles exigem estratégias diferentes.

## O Que Realmente Me Conseguiu Trabalho (Entrevistas e Interesse)

Depois de construir tudo isso, aqui está o que gerentes de contratação e clientes em potencial realmente valorizam:

1. **"Você construiu uma plataforma com 185 tabelas?"** — Escala impressiona. Não o número em si, mas o fato de que eu projetei e gerenciei tudo sozinho.

2. **"Você negocia os mesmos instrumentos que seu software analisa?"** — Expertise de domínio é rara. A maioria dos desenvolvedores fintech não usa seus próprios produtos.

3. **"Onde está o demo ao vivo?"** — O dashboard de qualidade no meu site de portfólio iniciou mais conversas do que meu currículo. As pessoas podem vê-lo funcionando.

4. **"Você escreveu um livro de 120K palavras?"** — Isso sinaliza comprometimento, pensamento profundo e habilidades de comunicação. Ninguém escreve 120K palavras por acaso.

5. **"Me mostre o GitHub"** — Eles querem ver código real, commits reais, pipelines de CI reais. Não uma página de portfólio polida — o repositório real.

## O Que Eu Diria a Alguém Começando Hoje

1. **Escolha uma coisa e entregue.** Não construa uma "plataforma". Construa uma única funcionalidade, faça deploy e mostre para uma pessoa. Depois construa a próxima funcionalidade.

2. **Documente obsessivamente.** Sua documentação é seu portfólio. Suas mensagens de commit são seu registro de trabalho. Seus documentos de arquitetura são seus estudos de caso.

3. **Construa o que você usa.** Construí ferramentas de trading porque eu negocio. Construí frameworks de teste porque eu testo. A convicção transparece quando você constrói para si mesmo.

4. **Não otimize antes de ter usuários.** Entregue a versão feia. Obtenha feedback. Depois refine.

5. **Seu portfólio É o projeto.** O meta-projeto de manter um site de portfólio com SLOs, drills de incidentes e artefatos de evidência é, por si só, prova de maturidade em engenharia.

## Um Ano Depois

Construí mais em um ano solo do que muitos times constroem em dois. Não porque sou mais rápido — porque não tenho reuniões, planning poker, cerimônias de sprint e nenhuma sobrecarga organizacional.

O trade-off é solidão, autodúvida e a pergunta constante: "Isso é bom o suficiente?" A resposta é sempre "entregue e descubra."
