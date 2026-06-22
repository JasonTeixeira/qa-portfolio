---
title: "GitHub OIDC → AWS (Sem Chaves de Longa Duração): Automação em Nuvem do Jeito Certo"
excerpt: "Como usar o OIDC do GitHub Actions para assumir uma função IAM da AWS e implantar/enviar artefatos sem armazenar chaves AWS. Inclui IAM de privilégio mínimo, padrões de política de confiança e dicas de solução de problemas."
sourceSlug: github-oidc-aws-no-long-lived-keys-cloud-automation-the-right-way
locale: pt
sourceHash: bfc0536b90edf6b9
machineTranslated: true
---

# GitHub OIDC → AWS (Sem Chaves de Longa Duração): Automação em Nuvem do Jeito Certo

Chaves estáticas da AWS em CI são um tiro no pé.

Se você quer automação em nuvem que escala (e passa na revisão de segurança), use **federação baseada em OIDC**:

- GitHub Actions emite um token de identidade de curta duração (OIDC)
- AWS STS troca esse token por credenciais AWS de curta duração
- Seu workflow assume uma função com privilégios mínimos e executa o trabalho

Este portfólio usa o mesmo padrão para suportar o **modo Cloud telemetry** (AWS S3) sem nunca incorporar credenciais de longa duração.

## A arquitetura
