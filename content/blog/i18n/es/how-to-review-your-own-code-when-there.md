---
title: "Cómo Revisar Tu Propio Código (Cuando No Hay Nadie Más)"
excerpt: "La ingeniería en solitario significa sin revisiones de código. He desarrollado un proceso de autorevisión que detecta el 80% de lo que encontraría un segundo par de ojos. Empieza con alejarse."
sourceSlug: how-to-review-your-own-code-when-there
locale: es
machineTranslated: true
---

# Cómo Revisar Tu Propio Código (Cuando No Hay Nadie Más)

En equipos grandes, cada PR es revisado por al menos otro ingeniero. En Sage Ideas, soy el único ingeniero. Nadie revisa mi código.

Esto es un problema. No porque escriba mal código — sino porque soy ciego a mis propias suposiciones. Todo desarrollador lo es.

He desarrollado un proceso de autorevisión que detecta la mayor parte de lo que captaría un segundo par de ojos. No es perfecto, pero es dramáticamente mejor que "se ve bien, fusionar".

## La Regla de las 24 Horas

Nunca reviso código que escribí hoy. El intervalo mínimo entre escribir y revisar es de 24 horas. Idealmente 48.

Esto suena lento. En realidad es rápido. En esas 24 horas, estoy construyendo otra cosa. Cuando vuelvo a revisar, he olvidado parcialmente mi implementación. Ese olvido es el objetivo — me permite leer el código como si lo hubiera escrito otra persona.

## La Lista de Verificación de Revisión

Reviso en 4 pasadas. Cada pasada busca cosas diferentes:

### Pasada 1: Leer como Usuario (5 minutos)
No mires el código. Abre el diff del PR y lee solo los nombres de archivo y el conteo de líneas.

Preguntas:
- ¿Tiene sentido el cambio solo con los nombres de archivo?
- ¿Está tocando demasiados archivos? (señal de un cambio acoplado)
- ¿Hay archivos que no deberían estar en este cambio?

### Pasada 2: Leer por Lógica (15 minutos)
Ahora lee el código. Pero no verifiques estilo, nombres o formato. Solo lógica.

Preguntas:
- ¿Funciona el camino feliz?
- ¿Qué sucede con entradas nulas/indefinidas?
- ¿Hay casos donde esto falla silenciosamente?
- ¿Estoy manejando el caso de error, o solo registrando y siguiendo adelante?
- ¿Hay una condición de carrera? (Especialmente en código asíncrono)

### Pasada 3: Leer por Seguridad (10 minutos)
