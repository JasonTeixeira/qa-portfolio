---
title: "Autenticação é Mais Difícil do Que Você Pensa"
excerpt: "Implementei autenticação 4 vezes em diferentes projetos. Toda vez pensei que levaria 2 dias. Toda vez levou 2 semanas. Aqui está o porquê e o que eu faria diferente."
sourceSlug: authentication-is-harder-than-you-think
locale: pt
machineTranslated: true
---

# Autenticação é Mais Difícil do Que Você Imagina

Todo plano de projeto que já escrevi tinha um item: "Autenticação — 2 dias."

Toda retrospectiva de projeto tem uma nota: "Auth levou 2 semanas."

Já construí sistemas de autenticação 4 vezes. Toda vez, eu subestimo. Aqui está o porquê, e o que finalmente aprendi.

## O Iceberg

O que você acha que auth é:
- Formulário de login
- Armazenar um token
- Verificar se o token é válido
- Pronto

O que auth realmente é:
- Formulário de login (email/senha + OAuth + magic links + MFA?)
- Hash de senha (bcrypt, argon2, qual fator de custo?)
- Gerenciamento de sessão (JWT vs session cookie vs ambos?)
- Atualização de token (refresh silencioso, rotação, revogação)
- Proteção CSRF (cookies same-site, token de dupla submissão)
- Limitação de taxa (no login, no registro, na redefinição de senha)
- Fluxo de redefinição de senha (geração de token, expiração, uso único)
- Verificação de email (token, lógica de reenvio, e se mudarem de email?)
- Bloqueio de conta (quantas tentativas? Qual o fluxo de desbloqueio?)
- Controle de acesso baseado em função (admin vs usuário vs moderador)
- Gerenciamento de chaves de API (para acesso programático)
- Invalidação de sessão ao alterar a senha
- "Lembrar de mim" vs "apenas esta sessão"
- Notificação de login de novo dispositivo
- Registro de auditoria (quem logou, quando, de onde)

Isso são 15+ funcionalidades. A 1-2 dias cada, você está olhando para um mês.

## O Que Faço Agora: Uso Supabase Auth e Estendo

Depois de construir auth personalizado duas vezes e odiar minha vida em ambas, agora começo com Supabase Auth (ou Clerk, ou Auth.js). Ele lida com:

- Email/senha com bcrypt
- Provedores OAuth (Google, GitHub, Discord)
- Tokens JWT com refresh
- Verificação de email
- Redefinição de senha
- Gerenciamento de sessão
- Limitação de taxa

Isso é 80% da autenticação, tratado por pessoas que pensam em auth em tempo integral. Eu foco nos 20% que são específicos do meu aplicativo:

\\\
