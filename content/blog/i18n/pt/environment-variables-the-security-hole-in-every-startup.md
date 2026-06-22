---
title: "Variáveis de Ambiente: A Falha de Segurança em Toda Startup"
excerpt: "Seu arquivo .env contém a senha do banco de dados, a chave secreta do Stripe e as credenciais da AWS. Está em uma mensagem do Slack, no laptop de um desenvolvedor e provavelmente em alguma imagem Docker. Vamos resolver isso."
sourceSlug: environment-variables-the-security-hole-in-every-startup
locale: pt
machineTranslated: true
---

# Variáveis de Ambiente: O Buraco de Segurança em Toda Startup

Auditoria rápida: onde está sua senha de banco de dados agora?

Se você respondeu "no arquivo .env na raiz do repositório" — você está na maioria. Se respondeu "também em uma mensagem no Slack para o novo contratado, um print no Confluence e hardcoded naquela função Lambda que o Dave escreveu antes de sair" — você está sendo honesto.

Variáveis de ambiente são a infraestrutura mais perigosa na maioria das startups porque todos as tratam como algo secundário.

## Os Erros Comuns

### Erro 1: .env no Controle de Versão

Já vi isso em repositórios de produção em empresas reais. Um
