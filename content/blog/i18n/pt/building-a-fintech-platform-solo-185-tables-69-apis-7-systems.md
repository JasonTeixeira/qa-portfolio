---
title: "Construindo uma Plataforma Fintech Solo: 185 Tabelas, 69 APIs, 7 Sistemas"
excerpt: "A história completa de arquitetura e construção do ecossistema Nexural do zero — design de banco de dados, arquitetura de API, integração com Stripe e lições de ser o único engenheiro em uma plataforma fintech em produção."
sourceSlug: building-a-fintech-platform-solo-185-tables-69-apis-7-systems
locale: pt
machineTranslated: true
---

# Construindo uma Plataforma Fintech Solo: 185 Tabelas, 69 APIs, 7 Sistemas

A maioria dos engenheiros trabalha em um serviço por vez. Eu construí um ecossistema inteiro.

A plataforma Nexural começou como uma ideia simples: um dashboard para minha comunidade de trading. Tornou-se uma plataforma fintech completa com 185 tabelas de banco de dados, 69 endpoints de API, faturamento Stripe, um bot para Discord com IA, um mecanismo de pesquisa, um estúdio de newsletter e um sistema de alertas em tempo real.

Projetei e construí tudo sozinho. Aqui está o que aprendi.

Sistema relacionado: [Construa um mapa de superfície e sistema de produto](/blog/build-a-product-surface-and-system-map) transforma o mesmo padrão de superfície/sistema em uma estrutura de construção repetível.

## O Escopo

Sete sistemas interconectados:
1. **Dashboard de Trading** — dados de mercado em tempo real, gráficos, acompanhamento de portfólio
2. **Mecanismo de IA para Discord** — mais de 30 comandos, integração com GPT-4o, moderação automática
3. **Mecanismo de Pesquisa** — mais de 71 métricas, análise de estratégia, importação CSV
4. **Sistema de Alertas** — integração com NinjaTrader 8, backend .NET, notificações em tempo real
5. **Estúdio de Newsletter** — geração e distribuição automatizada de conteúdo
6. **Rastreador de Estratégias** — monitoramento de desempenho entre sistemas de trading
7. **Suíte de Automação** — 61 suítes de teste, CI/CD, portões de qualidade

## Design de Banco de Dados em Escala

185 tabelas parece intimidador. O segredo foi o design em fases:

- **Fase 1 (Núcleo):** Usuários, autenticação, assinaturas — 20 tabelas
- **Fase 2 (Trading):** Instrumentos, posições, sinais — 35 tabelas
- **Fase 3 (Comunidade):** Integração com Discord, logs de moderação — 25 tabelas
- **Fase 4 (Analytics):** Métricas, relatórios, telemetria — 30 tabelas
- **Fase 5-7:** Pesquisa, alertas, newsletter — 75 tabelas

Cada fase teve sua própria migração, sua própria suíte de testes e seu próprio plano de reversão. Nunca modifiquei mais de um domínio por vez.

### Decisões de Esquema Que Fizeram Diferença

**Normalizado onde importa:** Usuário → Assinatura → Plano é totalmente normalizado. Sem atalhos de desnormalização que criariam bugs de faturamento.

**Desnormalizado onde velocidade importa:** Dashboards de trading consultam visões desnormalizadas. Um trader não se importa com 3FN — eles se importam com tempos de carregamento abaixo de 50ms.

**Segurança em nível de linha em todo lugar:** Políticas RLS do Supabase em todas as tabelas. Um usuário nunca pode ver os dados de outro usuário, mesmo que a API tenha um bug.

## Arquitetura de API

69 endpoints seguindo padrões consistentes:

\
