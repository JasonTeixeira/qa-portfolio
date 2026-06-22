---
title: "Cómo evaluar las funciones de IA antes de lanzarlas"
excerpt: "Un ciclo de evaluación práctico para funciones de IA: define la promesa, crea un conjunto de fallos, prueba los casos aburridos y mantén a un humano en el bucle hasta que el sistema gane confianza."
sourceSlug: how-to-evaluate-ai-features-before-you-ship-them
locale: es
machineTranslated: true
---

# Cómo evaluar funciones de IA antes de lanzarlas

Una función de IA no está terminada cuando funciona en la demo.

Esa es la trampa. Le haces tres preguntas amigables, responde dos y media, todos ven la forma del futuro, y de repente la hoja de ruta del producto tiene una función llamada "asistente de IA" donde debería haber una especificación.

No confío en esa versión del proceso. Confío en la más lenta: nombrar la promesa, escribir los casos de fallo, probar el camino aburrido, y mantener a un humano cerca hasta que el sistema demuestre que puede comportarse.

:::system-diagram title="Bucle de evaluación de IA" label="promesa -> prueba" nodes="Promesa,Fallos,Revisión,Lanzamiento"
La función no se evalúa una sola vez. Se mueve a través de un bucle: define la promesa, construye el conjunto de fallos, revisa los resultados reales, y solo entonces decide qué puede lanzarse.
:::

## Empieza con la promesa

La primera pregunta no es "¿Qué modelo deberíamos usar?"

La primera pregunta es: ¿qué se le permite creer al usuario después de que esta función responda?

Esa frase importa. Si la función resume un documento, el usuario cree que el resumen es fiel. Si redacta una respuesta de soporte, el usuario cree que no inventará una política de reembolsos. Si explica una señal de trading, el usuario cree que no es un consejo financiero disfrazado de tono amigable.

Escribe la promesa en una línea:

- "Esta función clasifica la solicitud y la dirige al flujo de trabajo correcto."
- "Esta función redacta una respuesta que un humano aprueba antes de enviarla."
- "Esta función busca en documentos internos y cita la fuente que utilizó."

Si la promesa ocupa un párrafo, la función aún no está definida.

## Construye el conjunto de fallos antes del camino feliz

La mayoría de las demos de IA están entrenadas accidentalmente para pasar la demo.

El conjunto de evaluación real debería incluir las entradas que hacen que el producto se sienta incómodo:

- solicitudes vagas
- instrucciones contradictorias
- contexto faltante
- inyección maliciosa de prompts
- documentos de políticas antiguos
- registros duplicados
- mensajes de clientes con enojo
- casos límite que cuestan dinero si se manejan mal

Para un flujo de trabajo de IA orientado al cliente, quiero al menos 25 ejemplos antes de confiar en la forma del sistema. No 25 filas perfectas de benchmark. Veinticinco ejemplos feos que representen el trabajo real.

El conjunto de evaluación no es papeleo. Es el límite del producto.

## Separa la calidad del modelo de la calidad del producto

Un modelo puede ser bueno y el producto puede ser malo.

El modelo puede producir una respuesta correcta sin cita. El flujo de trabajo puede citar el documento correcto pero ocultar la advertencia importante. La interfaz puede hacer que la respuesta parezca definitiva cuando solo es un borrador.

Califico las funciones de IA en capas:

1. ¿Entendió la tarea?
2. ¿Usó la fuente o herramienta correcta?
3. ¿Evitó hacer afirmaciones fuera de la fuente?
4. ¿Devolvió el resultado en una forma que el usuario pueda usar?
5. ¿La interfaz dejó claros la confianza y los límites del sistema?

Solo las dos primeras son principalmente preguntas del modelo. El resto son preguntas del producto.

## Mantén a un humano en el bucle más tiempo del que parece conveniente

La primera versión en producción de un flujo de trabajo de IA debería ser generalmente borrador-primero, no enviar-primero.

Eso suena menos mágico. Bien.

Borrador-primero te da datos de revisión. Muestra dónde editan los usuarios la salida, dónde la rechazan, qué campos corrigen, y qué tareas nunca deberían haberse automatizado en primer lugar.

El paso de revisión humana no es una muleta permanente. Es instrumentación.

Cuando las ediciones se vuelven predecibles, automatiza la edición. Cuando los rechazos se agrupan alrededor de un tipo de entrada, cambia el enrutador. Cuando el revisor sigue verificando la misma fuente manualmente, añade recuperación y citas.

No eliminas al humano porque la demo funcionó. Eliminas al humano cuando el registro de revisión dice que el sistema se lo ha ganado.

## La lista de verificación para lanzar

Antes de lanzar una función de IA, quiero tener esto en su lugar:

:::checklist title="Lista de verificación para lanzar funciones de IA" label="lista de verificación"
- Una promesa de una oración.
- Un conjunto de evaluación con ejemplos feos.
- Criterios de aprobado/fallo para cada ejemplo.
- Registro de prompt, llamadas a herramientas, fuentes y resultado.
- Un camino de revisión humana para salidas de alto riesgo.
- Un plan de contingencia cuando el modelo no esté disponible.
- Una forma de reportar salidas incorrectas desde la interfaz.
:::

- una promesa de una oración
- un conjunto de evaluación con ejemplos feos
- criterios de aprobado/fallo para cada ejemplo
- registro de prompt, llamadas a herramientas, fuentes y resultado
- un camino de revisión humana para salidas de alto riesgo
- un plan de contingencia cuando el modelo no esté disponible
- una forma de reportar salidas incorrectas desde la interfaz

Nada de esto hace que la función sea menos impresionante.

Hace que la función sea real.

:::offer-cta title="¿Necesitas evaluar una función de IA antes del lanzamiento?" label="siguiente paso" href="/tools/route-finder" cta="Encuentra tu ruta"
Usa el Route Finder para decidir si esto necesita una auditoría de IA, alcance de automatización, ruta de academia o construcción completa del producto.
:::

Sistema relacionado: [La auditoría de implementación de IA antes de construir](/blog/the-ai-implementation-audit-before-you-build) desglosa esta misma idea en una ruta de auditoría previa a la construcción para equipos que deciden qué automatizar primero.
