---
title: "Evaluación de RAG sin el teatro de benchmarks"
excerpt: "Una forma fundamentada de evaluar la generación aumentada por recuperación: cobertura de fuentes, fidelidad de citas, comportamiento de rechazo y utilidad a nivel de tarea."
sourceSlug: rag-evaluation-without-the-benchmark-theater
locale: es
machineTranslated: true
---

# Evaluación de RAG sin el Teatro de Benchmarks

El primer demo de RAG siempre funciona.

Subes el PDF limpio. Haces la pregunta obvia. El modelo encuentra el párrafo obvio y responde con el tono de un consultor bien financiado.

Luego un usuario hace la pregunta con el acrónimo incorrecto, la política cambió hace tres semanas, la respuesta vive en dos documentos, y el sistema cita un párrafo que suena relacionado pero en realidad no respalda la afirmación.

Ahí es cuando empieza el producto.

## La recuperación es la primera decisión del producto

La calidad de RAG comienza antes de que el modelo vea algo.

La capa de recuperación decide qué se le permite conocer al modelo. Si los fragmentos incorrectos regresan, la respuesta ya está comprometida. Un mejor prompt podría ocultar el problema. No lo solucionará.

Evalúo la recuperación con preguntas aburridas:

- ¿Apareció el documento correcto en los resultados principales?
- ¿Apareció la sección correcta, no solo el archivo correcto?
- ¿El material más nuevo superó al material más antiguo?
- ¿Funcionó la consulta cuando se redactó como lo haría un usuario real?
- ¿El sistema no devolvió nada cuando la respuesta honesta era nada?

Ese último punto importa. Un sistema de búsqueda que siempre devuelve algo le enseña al modelo a decir siempre algo.

## La fidelidad de las citas supera a la confianza en la respuesta

La respuesta no es suficiente.

Para cualquier sistema de conocimiento, quiero saber si la fuente citada realmente respalda la oración que se afirma.

Eso significa evaluar a nivel de afirmación, no solo a nivel de respuesta. Si la respuesta tiene cuatro afirmaciones y solo dos están respaldadas, la respuesta no es "mayormente correcta". Es peligrosa de una manera que parece pulida.

Una rúbrica simple funciona:

- Respaldada: la cita prueba directamente la afirmación.
- Parcial: la cita está relacionada pero no prueba completamente la afirmación.
- Sin respaldo: la cita no prueba la afirmación.
- Contradicha: la cita dice lo contrario.

No necesitas un benchmark elaborado para empezar. Necesitas 30 preguntas reales y la disciplina para marcar honestamente los fallos.

## La negativa es una característica

Los sistemas RAG necesitan saber cuándo no responder.

Eso significa probar preguntas donde el corpus no contiene la respuesta. También significa probar preguntas donde la respuesta es sensible, está desactualizada o depende de un contexto que el usuario no proporcionó.

Un buen comportamiento de negativa suena así:

"No veo eso en las fuentes disponibles. El documento más cercano relacionado es X, pero no responde la pregunta directamente."

Un mal comportamiento de negativa suena así:

"Basado en la información disponible, parece..."

Esa frase es donde las alucinaciones se ponen un blazer.

## El cuadro de mando útil

Para un sistema RAG interno, prefiero rastrear cinco métricas fundamentadas que una puntuación de benchmark impresionante:

1. Tasa de acierto de recuperación: ¿apareció la fuente correcta?
2. Fidelidad de citas: ¿la fuente respaldó la respuesta?
3. Precisión de negativa: ¿declinó preguntas no respaldadas?
4. Utilidad de la respuesta: ¿pudo el usuario dar el siguiente paso?
5. Distancia de edición: ¿cuánto necesitó cambiar un humano?

La última métrica es la más honesta. Si los usuarios siguen reescribiendo la respuesta, el sistema no les está ahorrando tiempo. Está creando un borrador educado que tienen que supervisar.

## Empieza lo suficientemente pequeño para medir

El primer sistema RAG correcto generalmente no es el "cerebro de la empresa".

Es un corpus, un flujo de trabajo, un tipo de usuario y una acción clara después de la respuesta. Macros de soporte. Habilitación de ventas. Consulta de políticas. Documentación interna de ingeniería. Búsqueda de cláusulas de contratos.

Un alcance limitado hace posible la evaluación.

La evaluación hace posible la confianza.

La confianza hace posible la expansión.

Ese orden importa.
