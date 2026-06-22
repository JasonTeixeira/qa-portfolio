---
title: "Otimização de Custos na AWS: Como Mantenho uma Plataforma de Produção Abaixo de US$ 50/Mês"
excerpt: "A plataforma Nexural roda na AWS com Vercel, Supabase e serviços AWS direcionados. Veja como mantenho os custos abaixo de US$ 50/mês para uma plataforma com 185 tabelas e dados em tempo real."
sourceSlug: aws-cost-optimization-how-i-keep-a-production-platform-under-50-month
locale: pt
sourceHash: 7589c8d533227578
machineTranslated: true
---

# Otimização de Custos na AWS: Como Manter uma Plataforma de Produção por Menos de US$ 50/Mês

O ecossistema Nexural tem 185 tabelas de banco de dados, 69 endpoints de API, dados de mercado em tempo real, funcionalidades com IA e um painel de qualidade ao vivo. Minha conta da AWS fica abaixo de US$ 50/mês.

Veja como.

## A Arquitetura que Economiza Dinheiro

**Princípio: use serviços gerenciados em seus níveis gratuitos/baratos em vez de gerenciar sua própria infraestrutura.**

| Serviço | O Que Faz | Custo Mensal |
|---------|-----------|-------------|
| Vercel (Hobby → Pro) | Hospedagem Next.js, funções de edge | US$ 0-20 |
| Supabase (Free → Pro) | PostgreSQL, Autenticação, Tempo real | US$ 0-25 |
| AWS S3 | Dados de telemetria, artefatos | US$ 0,02 |
| AWS Lambda | Proxy de API, ingestão de telemetria | US$ 0 (nível gratuito) |
| AWS API Gateway | Endpoint HTTP do Lambda | US$ 0 (nível gratuito) |
| AWS CloudFront | CDN + WAF | US$ 0 (nível gratuito) |
| GitHub Actions | CI/CD, tarefas agendadas | US$ 0 (gratuito para repositórios públicos) |

**Total: ~US$ 25-45/mês** para uma plataforma de produção.

## Os Truques

### 1. Supabase em vez de RDS

Uma instância Pro do Supabase custa US$ 25/mês e inclui:
- PostgreSQL 15 com 8 GB de armazenamento
- Segurança em nível de linha
- Assinaturas em tempo real
- Autenticação integrada
- Backups automáticos

Uma instância RDS equivalente (db.t3.micro) custa US$ 15/mês, mas você precisa gerenciar backups, autenticação e tempo real por conta própria. Adicione esses serviços e você chega a US$ 60+.

### 2. Lambda para Cargas de Trabalho Esporádicas

A API de ingestão de telemetria lida com 0 requisições na maior parte do tempo e depois tem picos durante as execuções de CI. O Lambda é perfeito: US$ 0 quando ocioso, centavos durante os picos.
