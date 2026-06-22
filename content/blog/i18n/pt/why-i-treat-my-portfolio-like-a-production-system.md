---
title: "Por que trato meu portfólio como um sistema de produção"
excerpt: "SLOs, simulações de incidentes, limitação de taxa WAF e federação OIDC — por que opero meu site de portfólio com o mesmo rigor da infraestrutura empresarial e o que isso sinaliza para gerentes de contratação."
sourceSlug: why-i-treat-my-portfolio-like-a-production-system
locale: pt
machineTranslated: true
---

# Por Que Trato Meu Portfólio Como um Sistema de Produção

A maioria dos portfólios de desenvolvedores são sites estáticos. O meu tem SLOs.

Isso não é sobre engenharia excessiva. É sobre demonstrar uma habilidade específica que é difícil de mostrar em entrevistas: **maturidade operacional**.

:::proof-note title="Um portfólio pode provar maturidade operacional" label="comprovante"
O ponto não é apenas o polimento visual. O ponto é mostrar monitoramento, fallbacks, evidências e comportamento em falhas na mesma superfície que um gerente de contratação ou comprador pode inspecionar.
:::

## O Que "Portfólio de Nível de Produção" Significa

Meu site de portfólio (sageideas.dev) tem:

- **Metas de SLO:** 99,9% de disponibilidade do dashboard, frescor de telemetria <24h, tempo de resposta P95 <500ms
- **Simulações de incidentes:** 4 cenários de falha testados com respostas documentadas
- **Limitação de taxa WAF:** Web ACL do CloudFront com evidências de simulação de ataque
- **Federação OIDC:** GitHub Actions → AWS sem credenciais estáticas
- **Telemetria de qualidade:** Dashboard ao vivo puxando artefatos de CI em tempo real
- **Comprovantes de segurança:** Políticas IAM, modelos de ameaça e evidências para cada afirmação

## Por Que Se Importar?

Porque a lacuna entre "consigo construir coisas" e "consigo operar coisas" é onde os cargos sêniores estão.

Engenheiros juniores constroem funcionalidades. Engenheiros de nível médio constroem sistemas. Engenheiros sêniores **operam** sistemas — eles pensam em modos de falha, raio de explosão, custo, conformidade e o que acontece às 3h da manhã.

Ao tratar meu portfólio como produção, estou mostrando:

1. **Penso na falha antes que ela aconteça** — toda dependência externa tem um fallback
2. **Meço o que importa** — SLOs, não métricas de vaidade
3. **Documento para a próxima pessoa** — runbooks, playbooks, documentos de arquitetura
4. **Não corto caminhos em segurança** — mesmo para um site de portfólio

## O Padrão de Simulação de Incidentes

A cada trimestre, executo 4 cenários:

:::scorecard title="Simulação de incidentes do portfólio" label="placar"
Cenário | Resposta | Status
Limites de taxa da API do GitHub | Cair para modo snapshot | Testado
Artefato de CI ausente | Escanear execuções recentes, degradar graciosamente | Testado
Incompatibilidade de token proxy AWS | Alarme CloudWatch, degradação automática | Testado
Objeto S3 ausente | Falha fechada, sem vazamento de segredos | Testado
:::

| Cenário | Resposta | Status |
|---|---|---|
| Limites de taxa da API do GitHub | Cair para modo snapshot | Testado |
| Artefato de CI ausente | Escanear execuções recentes, degradar graciosamente | Testado |
| Incompatibilidade de token proxy AWS | Alarme CloudWatch, degradação automática | Testado |
| Objeto S3 ausente | Falha fechada, sem vazamento de segredos | Testado |

Cada simulação segue: **detectar → triar → mitigar → verificar → documentar**

O relatório da simulação está disponível publicamente na minha biblioteca de artefatos.

## O Que Gerentes de Contratação Notam

Quando entrevisto para cargos sênior/staff, não falo sobre o design do meu portfólio. Falo sobre suas operações:

- "Aqui está meu dashboard de SLO. Estamos em 99,94% este mês."
- "Aqui está um teste de limitação de taxa WAF que executei na semana passada. 429s disparam a 100 req/5min."
- "Aqui está a política IAM. A Lambda tem exatamente uma permissão: s3:GetObject em uma chave."

Isso muda a conversa de "você sabe programar?" para "você sabe operar sistemas?" — que é o que cargos acima de $200K realmente exigem.

## Como Fazer Isso Você Mesmo

Você não precisa da AWS. Comece pequeno:

1. **Defina um SLO** — "Meu site terá 99% de uptime este mês." Monitore-o.
2. **Adicione um portão de qualidade** — Lighthouse CI no seu pipeline de deploy. Falhe o build se o desempenho cair.
3. **Documente um modo de falha** — "Se minha chave de API expirar, o que acontece?" Escreva a resposta.
4. **Execute uma simulação de incidente** — Quebre algo intencionalmente e pratique a resposta.

O objetivo não é perfeição. É demonstrar que você pensa em produção, não apenas em desenvolvimento.

:::offer-cta title="Precisa desse tipo de camada de prova?" label="próximo passo" href="/tools/route-finder" cta="Encontre sua rota"
Use o Route Finder para decidir se seu site precisa de uma auditoria, um sistema de prova, suporte da academia ou uma reconstrução completa.
:::

Sistema relacionado: [O que um estúdio nativo de IA realmente constrói](/blog/what-an-ai-native-studio-actually-builds) explica por que o portfólio é tratado como superfície de produto, sistema operacional e ciclo de crescimento ao mesmo tempo.
