---
title: "Tudo que Lancei Este Ano (E o que Eu Cortaria em Retrospecto)"
excerpt: "Uma retrospectiva de fim de ano: 7 sistemas, 185 tabelas, 51 posts de blog, um livro e uma carreira de trader. O que valeu a pena, o que não valeu, e o que estou construindo em seguida."
sourceSlug: everything-i-shipped-this-year-and-what-i
locale: pt
machineTranslated: true
---

# Tudo o que Lancei Este Ano (E o que eu Cortaria em Retrospecto)

Há um ano, fundei a Sage Ideas LLC com um plano vago: construir ferramentas de trading, oferecer consultoria e ver no que dá. Aqui está o retrospecto honesto.

## O que Lancei

**O Ecossistema Nexural** — 7 sistemas interconectados:
1. Painel de Trading (185 tabelas, 69 APIs, faturamento Stripe)
2. Mecanismo de IA para Discord (30+ comandos, GPT-4o, 12 fases)
3. Mecanismo de Pesquisa (71+ métricas, análise de estratégia)
4. Sistema de Alertas (.NET 8, integração NinjaTrader)
5. Estúdio de Newsletter (pipeline automatizado de conteúdo)
6. Rastreador de Estratégias (análise de desempenho)
7. Suíte de Automação (61 suítes de teste)

**AlphaStream** — Sinais de trading com ML (200+ indicadores, 5 modelos)

**RiskRadar** — Plataforma de risco de portfólio (Ledoit-Wolf, CVaR, otimização)

**Este Portfólio** — O site que você está lendo. SLOs, simulações de incidentes, painel ao vivo, 27 artefatos, 51 posts de blog.

**O Livro** — 120.000 palavras sobre trading. 24 capítulos. Em fase editorial.

**Trading Ativo** — 8 símbolos no NinjaTrader. ES, NQ, CL, GC e mais.

## O que Valeu Cada Hora

**A Plataforma Nexural.** É a peça central do meu portfólio. Toda entrevista e conversa com cliente começa com "você construiu uma plataforma com 185 tabelas?" A profundidade deste projeto abre portas que uma dúzia de projetos menores jamais abriria.

**O Blog.** 51 posts formam um corpo de trabalho que sinaliza "esta pessoa pensa profundamente." Cada post é um artefato compartilhável. Quando me candidato a um emprego, incluo um link para um post relevante. É mais convincente do que um tópico no currículo.

**A Página de Engenharia de Plataforma.** SLOs, simulações de incidentes, comprovantes de segurança — só esta página mudou conversas de entrevista de "você sabe programar?" para "conte-me sobre sua experiência operacional." Essa mudança é a diferença entre ofertas de nível pleno e sênior.

## O que eu Cortaria

**Nexural Newsletter Studio.** Construí, mal usei. A comunidade de trading queria alertas no Discord, não newsletters por e-mail. Eu deveria ter validado a demanda antes de construir.

**Múltiplos Frameworks de Teste de API.** Tenho 3 repositórios que fazem coisas similares: API-Test-Automation-Wireframe, API-Testing-Framework e a suíte de teste de API no E-Commerce-Test-Suite. Eu deveria ter construído um framework excelente em vez de três medíocres.

**A suíte de teste de regressão visual.** A integração com Percy é legal, mas o repositório tem 1 commit e testa 1 página. Se eu tivesse gasto essas horas melhorando o E-Commerce-Test-Suite, meu melhor repositório de QA seria ainda mais forte.

## O que Aprendi Sobre Construir

**Lance a primeira versão feia.** O primeiro deploy do painel Nexural foi constrangedor. Sem estilo, layout mobile quebrado, dados de placeholder. Mas estava no ar, recebi feedback, e a versão 2 ficou 10x melhor por causa disso.

**Documente enquanto constrói, não depois.** Todo sistema que documentei de antemão foi mais fácil de manter. Todo sistema que disse "vou documentar depois" virou uma caixa de mistério em 3 meses.

**Seu portfólIO É o emprego.** Passei mais tempo em sageideas.dev do que na maioria dos projetos de clientes. O ROI tem sido enorme — interesse espontâneo, conversas de entrevista que começam em um nível mais alto e prova de maturidade operacional que nenhum tópico de currículo consegue igualar.

## O que Estou Construindo em Seguida

Tenho três coisas no meu roadmap:

1. **Melhorar projetos existentes.** Os 11 repositórios públicos no meu portfólio precisam de READMEs mais robustos, mais commits, CI melhor e capturas de tela reais. Qualidade sobre quantidade.

2. **Uma biblioteca de módulos Terraform.** Módulos AWS reutilizáveis para os padrões que construí várias vezes. Isso preenche a lacuna de infraestrutura no meu portfólio.

3. **Contribuições open-source.** Mesmo PRs pequenos para projetos estabelecidos adicionam credibilidade. Quero de 5 a 10 contribuições significativas para projetos que realmente uso (Next.js, Supabase, Playwright).

## Os Números Honestos

| Métrica | Valor |
|---------|-------|
| Sistemas lançados | 7 |
| Tabelas de banco de dados projetadas | 185 |
| Endpoints de API construídos | 69 |
| Posts de blog escritos | 50 |
| Palavras do livro escritas | 120.000 |
| Certificações obtidas | 9 |
| Suítes de teste em execução | 61 |
| Commits no GitHub | 500+ |
| Receita gerada | Privada, mas suficiente para financiar a construção |
| Horas trabalhadas | Muitas para contar |

## A Conclusão Final

Construir em público por um ano me ensinou que o trabalho em si é o portfólio. Não uma lista de tópicos — os sistemas reais em funcionamento, os posts honestos do blog, a documentação que sobrevive a você.

Se você está começando sua própria marca de engenharia, meu conselho é simples: construa coisas reais, documente obsessivamente, seja honesto sobre fracassos e lance antes de estar pronto.

O portfólio perfeito não existe. O que foi lançado, sim.
