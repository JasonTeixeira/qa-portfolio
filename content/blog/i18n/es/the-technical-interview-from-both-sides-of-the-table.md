---
title: "La Entrevista Técnica Desde Ambos Lados de la Mesa"
excerpt: "He sido el candidato sudando con preguntas de diseño de sistemas y el entrevistador evaluándolas. La brecha entre lo que buscan los entrevistadores y lo que preparan los candidatos es enorme."
sourceSlug: the-technical-interview-from-both-sides-of-the-table
locale: es
machineTranslated: true
---

# La Entrevista Técnica Desde Ambos Lados de la Mesa

He estado en ambos lados. He dibujado diseños de sistemas en una pizarra mientras un entrevistador asentía en silencio. También he sido yo quien asentía, observando a un candidato diseñar un sistema de notificaciones en una pizarra.

La brecha entre lo que los candidatos preparan y lo que los entrevistadores realmente evalúan es abismal.

## Lo Que los Candidatos Preparan

- Problemas difíciles de LeetCode
- Preguntas triviales sobre algoritmos oscuros
- "Cuéntame sobre una vez que..."
- Respuestas memorizadas de diseño de sistemas

## Lo Que los Entrevistadores Realmente Evalúan

- **Cómo manejas la ambigüedad.** Lo primero que hago cuando me dan un problema de diseño de sistemas es hacer preguntas aclaratorias. "¿Cuántos usuarios? ¿Cuál es el requisito de latencia? ¿Cuál es el presupuesto?" Los candidatos que empiezan a dibujar cajas antes de hacer preguntas son una señal de alerta. Construyen sin entender los requisitos — y harán lo mismo en el trabajo.

- **Conciencia de compensaciones.** No existe la arquitectura perfecta. Cada elección tiene un costo. Cuando un candidato dice "deberíamos usar Kafka para la cola de mensajes", pregunto "¿por qué no SQS?" Si pueden articular la compensación (Kafka: mayor rendimiento, más sobrecarga operativa, mejor reproducción; SQS: más simple, gestionado, suficientemente bueno para la mayoría de los casos), entienden la ingeniería. Si dicen "Kafka es el estándar de la industria", están siguiendo modas sin entender.

- **Pensamiento en modos de fallo.** "¿Qué pasa cuando este servicio se cae?" Si la respuesta es "no se caerá", sé que nunca han operado un sistema en producción. Todo se cae. La cuestión es si has diseñado para ello.

- **Claridad en la comunicación.** ¿Puedes explicar tu diseño a una persona no técnica en la sala? Los roles senior implican comunicarse con gerentes de producto, diseñadores y ejecutivos. Si solo puedes explicar tu sistema a otros ingenieros, has alcanzado tu límite.

## Las Preguntas Que Hago (y Qué Estoy Realmente Evaluando)

**"Cuéntame sobre un proyecto reciente del que estés orgulloso."**

Estoy evaluando: ¿Puedes contar una historia coherente? ¿Mencionas restricciones, no solo tecnología? ¿Le das crédito a tu equipo o te llevas todo el crédito? ¿Mencionas qué harías diferente?

**"Estás recibiendo errores 500 en producción. Cuéntame tu proceso de depuración."**

Estoy evaluando: ¿Tienes un enfoque sistemático o adivinas? ¿Revisas registros y métricas primero, o empiezas a cambiar código? ¿Piensas en el radio de afectación?

**"Diseña un sistema para [X]. Tienes 45 minutos."**

Estoy evaluando: ¿Haces preguntas primero? ¿Empiezas con requisitos o con tecnología? ¿Mencionas monitoreo, manejo de errores y escalado — o solo el camino feliz?

## Lo Que Cambió Cuando Empecé a Entrevistar

Como candidato, pensaba que el entrevistador quería la "respuesta correcta". Como entrevistador, aprendí que no hay respuesta correcta. Estoy evaluando tu proceso de pensamiento.

El candidato que diseña un sistema simple, reconoce sus limitaciones y explica cuándo añadiría complejidad es más fuerte que el candidato que diseña un sistema complejo que no puede explicar.

## Mi Consejo (Desde Ambos Lados)

**Para candidatos:**
1. Haz 3-5 preguntas aclaratorias antes de diseñar cualquier cosa
2. Empieza simple y añade complejidad cuando te lo pidan
3. Menciona modos de fallo sin que te lo pregunten ("si este servicio se cae, esto es lo que pasa")
4. Explica las compensaciones para cada decisión importante
5. Sé honesto sobre lo que no sabes — "No he usado Kafka a escala, pero entiendo los beneficios de rendimiento. Para este caso de uso, empezaría con SQS y migraría si necesitamos reproducción"

**Para entrevistadores:**
1. No evalúes conocimiento específico de tecnología — evalúa criterio de ingeniería
2. Pregunta "¿qué harías diferente?" — los mejores ingenieros tienen opiniones sólidas sobre su propio trabajo
3. Dale espacio a los candidatos para recuperarse de errores — cómo manejan estar equivocados te dice más que acertar

Las mejores entrevistas se sienten como sesiones de trabajo. Las peores se sienten como interrogatorios. Diseña para las primeras.
