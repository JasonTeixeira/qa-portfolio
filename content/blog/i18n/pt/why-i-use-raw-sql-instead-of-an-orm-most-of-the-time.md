---
title: "Por que uso SQL puro em vez de um ORM (na maioria das vezes)"
excerpt: "ORMs são ótimos até deixarem de ser. Depois de depurar consultas geradas que levavam 30 segundos em um banco de dados com 185 tabelas, mudei para SQL puro nos caminhos críticos. Veja quando cada um faz sentido."
sourceSlug: why-i-use-raw-sql-instead-of-an-orm-most-of-the-time
locale: pt
sourceHash: 8704afb8dd6233ff
machineTranslated: true
---

# Por Que Uso SQL Puro em Vez de um ORM (Na Maioria das Vezes)

Isso vai ser polêmico, então deixe-me começar com a ressalva: ORMs são bons. Prisma, SQLAlchemy, Drizzle — são todas ferramentas boas construídas por pessoas inteligentes. Eu as uso.

Mas para a plataforma Nexural — 185 tabelas, joins complexos, views materializadas, segurança em nível de linha — SQL puro foi a escolha certa para os caminhos críticos. Eis o porquê.

## O Momento em que Mudei

Eu estava usando Prisma. O dashboard carregava em 200ms localmente. Em produção com dados reais, levava 4,2 segundos.

Eu rodei \\\
