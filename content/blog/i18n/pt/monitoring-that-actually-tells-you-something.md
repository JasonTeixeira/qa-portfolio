---
title: "Monitoramento Que Realmente Diz Algo"
excerpt: "Painéis com 47 gráficos onde tudo está verde não são monitoramento. São decoração. Veja o que eu realmente monitoro e por que a maioria dos alertas é ruído inútil."
sourceSlug: monitoring-that-actually-tells-you-something
locale: pt
sourceHash: 4c2fd7867d8e623f
machineTranslated: true
---

# Monitoramento Que Realmente Te Diz Algo

Certa vez, herdei uma instância do Grafana com 47 painéis. Utilização de CPU, uso de memória, I/O de disco, bytes de rede, heap da JVM — toda métrica que você pudesse imaginar. Tudo estava verde. O tempo todo.

Dois dias depois, a API ficou fora do ar por 4 horas. Nem um único alerta disparou.

Por quê? Porque a CPU estava em 22%, a memória em 45% e o disco em 30%. Tudo "saudável". O problema real era uma exaustão do pool de conexões — uma métrica que ninguém estava monitorando.

## Os Quatro Sinais de Ouro (e Nada Mais)

O livro SRE do Google acertou em cheio. Você precisa exatamente de quatro sinais:

**1. Latência** — Quanto tempo as requisições levam?
Não a latência média — isso esconde problemas. Acompanhe P50, P95 e P99:

- P50 = 200ms significa que metade dos seus usuários recebe respostas em 200ms (bom)
- P95 = 800ms significa que 1 em cada 20 usuários espera 800ms (aceitável)
- P99 = 5000ms significa que 1 em cada 100 usuários espera 5 segundos (problema)

Seu P99 é seu desempenho real. A média mente.

**2. Tráfego** — Quantas requisições você está processando?
Esta é sua linha de base. Se o tráfego cair 80% às 14h de uma terça-feira, algo está errado, mesmo que todas as outras métricas estejam verdes.

**3. Erros** — Qual porcentagem de requisições falha?
Acompanhe a taxa de erro, não a contagem de erros. 100 erros em 1 milhão de requisições (0,01%) é aceitável. 100 erros em 200 requisições (50%) é uma interrupção.

**4. Saturação** — Quão cheio está seu sistema?
Conexões de banco de dados, memória, profundidade de fila, pools de threads. Quando qualquer recurso atinge 80% de utilização, você precisa agir — não porque está quebrado, mas porque você perdeu sua margem de segurança.

## Minha Configuração Real de Monitoramento

Para a plataforma Nexural:

\\\
