---
title: "A Decisão de Arquitetura Que Ninguém Documenta"
excerpt: "Passamos semanas escolhendo entre Kafka e RabbitMQ, mas nunca documentamos o porquê. ADRs levam 15 minutos e economizam meses de conversas do tipo 'por que fizemos isso?'."
sourceSlug: the-architecture-decision-nobody-writes-down
locale: pt
machineTranslated: true
---

# A Decisão de Arquitetura Que Ninguém Documenta

Há seis meses, escolhi Supabase em vez de Firebase para o Nexural. Eu tinha bons motivos — PostgreSQL, segurança em nível de linha, auto-hospedável. Mas quase esqueci esses motivos. A única coisa que me salvou de reavaliar a mesma decisão (e perder uma semana) foi um arquivo markdown que escrevi em 15 minutos.

## O Problema

Toda equipe de engenharia tem essa conversa:

"Por que usamos RabbitMQ em vez de Kafka?"
"Acho que o Dave escolheu. O Dave saiu há 8 meses."
"..."
"Devemos migrar para o Kafka?"

E agora você está gastando uma sprint reavaliando uma decisão que já foi avaliada. O conhecimento institucional foi embora pela porta.

## Registros de Decisão de Arquitetura (ADRs)

Um ADR é um documento curto que captura uma decisão significativa. Os meus são extremamente simples:

\\\
