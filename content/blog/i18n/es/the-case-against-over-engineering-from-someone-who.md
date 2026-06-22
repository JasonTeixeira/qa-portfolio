---
title: "El caso contra la sobreingeniería (de alguien que lo ha hecho)"
excerpt: "Una vez construí una arquitectura de plugins para un sistema que nunca necesitó plugins. 3 semanas de capas de abstracción para una función que nadie pidió. Así aprendí a parar."
sourceSlug: the-case-against-over-engineering-from-someone-who
locale: es
machineTranslated: true
---

# El Caso Contra la Sobreingeniería (De Alguien Que Lo Ha Hecho)

Tengo una confesión. En 2023, pasé tres semanas construyendo un sistema de plugins para un framework de automatización de pruebas. Ejecutores de pruebas configurables. Plugins recargables en caliente. Un contenedor de inyección de dependencias. Todo el paquete.

Nadie escribió nunca un plugin.

El framework se ejecutaba en CI con la misma configuración cada vez. La "extensibilidad" que construí fue utilizada por exactamente cero personas. Podría haber enviado todo el proyecto en 4 días sin la arquitectura de plugins.

## Cómo Ocurre la Sobreingeniería

Comienza con un pensamiento razonable: "¿Y si necesitamos extender esto más adelante?"

Ese pensamiento es la trampa. Porque "más adelante" rara vez se parece a lo que imaginaste, y las abstracciones que construyes para requisitos imaginarios suelen interponerse en el camino de los reales.

Aquí está la progresión que he observado en mí mismo:

1. Construir una función simple ✅
2. Pensar "esto debería ser configurable" ⚠️
3. Agregar un objeto de configuración
4. Pensar "diferentes entornos podrían necesitar diferentes implementaciones" ⚠️
5. Agregar una interfaz y un patrón de fábrica
6. Pensar "podríamos necesitar intercambiar esto en tiempo de ejecución" 🚩
7. Agregar inyección de dependencias
8. Darte cuenta de que nadie ha necesitado intercambiarlo nunca
9. Mantener la abstracción para siempre porque eliminarla es más difícil que conservarla

## Las Tres Preguntas

Antes de agregar cualquier abstracción, ahora me pregunto:

**1. "¿Alguien ha pedido esto realmente?"**

Si la respuesta es "no, pero podrían" — no lo construyas. YAGNI (You Aren't Gonna Need It) es el principio más violado en ingeniería.

**2. "¿Cuál es el costo de agregar esto después en lugar de ahora?"**

Si puedo agregar la abstracción en 2 horas cuando realmente se necesite, no hay razón para construirla ahora "por si acaso". El costo de la abstracción prematura (mantener código que nadie usa) es casi siempre mayor que el costo de agregarla después.

**3. "¿Puedo explicar por qué existe esto a alguien en una oración?"**

"Usamos inyección de dependencias porque necesitamos intercambiar el proveedor de pagos entre Stripe y Braintree en diferentes entornos." Esa es una razón real.

"Usamos inyección de dependencias porque es una buena práctica." Eso no es una razón. Eso es seguir la corriente sin pensar.

## Cómo Se Ve el Código Simple
