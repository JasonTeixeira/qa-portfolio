---
title: "Projetando um Esquema de Banco de Dados com 185 Tabelas: Lições da Construção da Nexural"
excerpt: "Como projetei um esquema de banco de dados normalizado para uma plataforma fintech com 7 sistemas interconectados. Fases do esquema, políticas RLS, trade-offs de desnormalização e estratégias de migração."
sourceSlug: designing-a-185-table-database-schema-lessons-from-building-nexural
locale: pt
sourceHash: 35047aee80b62eef
machineTranslated: true
---

# Projetando um Esquema de Banco de Dados com 185 Tabelas: Lições da Criação do Nexural

Quando as pessoas ouvem "185 tabelas de banco de dados," elas assumem complexidade por complexidade. Mas cada tabela existe porque um requisito de negócio a exigiu.

Aqui está como projetei o esquema do Nexural — as decisões que funcionaram, as que eu mudaria e os padrões que escalam.

:::system-diagram title="Crescimento do esquema Nexural" label="esquema -> sistemas" nodes="Auth,Cobrança,Trading,Operações"
O banco de dados não começou como um esquema gigante. Ele cresceu à medida que os domínios do produto se tornaram reais: usuários, assinaturas, fluxos de trading, funcionalidades da comunidade, análises, pesquisa e operações.
:::

## Design de Esquema Baseado em Fases

Não projetei 185 tabelas no primeiro dia. O esquema cresceu ao longo de 7 fases, cada uma adicionando um domínio:

:::scorecard title="Fases de construção do esquema" label="scorecard"
Fase | Domínio | Tabelas | Decisão-chave
1 | Auth & Usuários | 12 | Supabase Auth + perfis personalizados
2 | Assinaturas | 8 | Máquina de estados orientada por webhook do Stripe
3 | Trading | 35 | Instrumentos, posições, sinais, listas de observação
4 | Comunidade | 25 | Sincronização com Discord, logs de moderação, reputação
5 | Análises | 30 | Métricas, relatórios, eventos de telemetria
6 | Pesquisa | 40 | Estratégias, indicadores, resultados de backtest
7 | Operações | 35 | Alertas, newsletters, logs de auditoria
:::

| Fase | Domínio | Tabelas | Decisão-chave |
|------|---------|---------|---------------|
| 1 | Auth & Usuários | 12 | Supabase Auth + perfis personalizados |
| 2 | Assinaturas | 8 | Máquina de estados orientada por webhook do Stripe |
| 3 | Trading | 35 | Instrumentos, posições, sinais, listas de observação |
| 4 | Comunidade | 25 | Sincronização com Discord, logs de moderação, reputação |
| 5 | Análises | 30 | Métricas, relatórios, eventos de telemetria |
| 6 | Pesquisa | 40 | Estratégias, indicadores, resultados de backtest |
| 7 | Operações | 35 | Alertas, newsletters, logs de auditoria |

Cada fase teve seu próprio lote de migração. Nunca modifiquei tabelas de uma fase anterior durante o desenvolvimento de uma nova fase. Isso manteve as implantações seguras.

## As Três Regras que Segui

### Regra 1: Normalize Tudo, Exceto Caminhos Quentes

Os dados canônicos são sempre normalizados. \
