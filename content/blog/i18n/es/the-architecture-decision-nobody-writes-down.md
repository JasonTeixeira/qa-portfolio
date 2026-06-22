---
title: "La Decisión de Arquitectura Que Nadie Documenta"
excerpt: "Pasamos semanas eligiendo entre Kafka y RabbitMQ pero nunca documentamos por qué. Las ADR toman 15 minutos y ahorran meses de conversaciones de '¿por qué hicimos esto?'."
sourceSlug: the-architecture-decision-nobody-writes-down
locale: es
machineTranslated: true
---

# La Decisión de Arquitectura que Nadie Documenta

Hace seis meses, elegí Supabase en lugar de Firebase para Nexural. Tenía buenas razones — PostgreSQL, seguridad a nivel de fila, auto-alojable. Pero casi olvido esas razones. Lo único que me salvó de reevaluar la misma decisión (y perder una semana) fue un archivo markdown que escribí en 15 minutos.

## El Problema

Todo equipo de ingeniería tiene esta conversación:

"¿Por qué usamos RabbitMQ en lugar de Kafka?"
"Creo que Dave lo eligió. Dave se fue hace 8 meses."
"..."
"¿Deberíamos cambiarnos a Kafka?"

Y ahora estás gastando un sprint reevaluando una decisión que ya fue evaluada. El conocimiento institucional se fue por la puerta.

## Registros de Decisiones de Arquitectura (ADR)

Un ADR es un documento breve que captura una decisión significativa. Los míos son extremadamente simples:

\\\
