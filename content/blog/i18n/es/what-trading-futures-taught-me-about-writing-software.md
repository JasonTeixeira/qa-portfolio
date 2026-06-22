---
title: "Lo que el trading de futuros me enseñó sobre escribir software"
excerpt: "Opero futuros ES, NQ y CL cada mañana antes de escribir código. Los paralelismos entre la gestión de riesgos en el trading y en el software son incómodamente similares."
sourceSlug: what-trading-futures-taught-me-about-writing-software
locale: es
machineTranslated: true
---

# Lo que el Trading de Futuros me Enseñó sobre Escribir Software

Cada mañana a las 6am, antes de escribir una sola línea de código, estoy mirando gráficos de futuros. ES (S&P 500), NQ (Nasdaq), CL (Crudo), GC (Oro) — 8 símbolos en NinjaTrader, buscando configuraciones.

He estado haciendo trading durante años. Y cuanto más hago ambas cosas — trading y construir software — más me doy cuenta de que son la misma disciplina con ropa diferente.

## Lección 1: Gestión de Riesgo > Tener Razón

En trading, puedes estar equivocado el 60% del tiempo y aún así ganar dinero. Suena imposible, pero la matemática es simple: si tus ganancias son 2 veces el tamaño de tus pérdidas, solo necesitas ganar el 34% del tiempo para estar en equilibrio.

Lo mismo ocurre en software. No necesitas que cada decisión arquitectónica sea perfecta. Necesitas que los fallos sean pequeños y los aciertos se acumulen.

Por eso yo:
- Despliego cambios pequeños (operaciones perdedoras pequeñas)
- Uso feature flags para cambios riesgosos (stop losses)
- Tengo procedimientos de reversión (estrategia de salida)
- Nunca despliego en viernes (nunca mantengo durante el fin de semana)

Un trader que arriesga toda su cuenta en una sola operación explotará. Un desarrollador que despliega un cambio masivo sin probar a producción explotará. Misma energía.

## Lección 2: La Configuración Importa Más que la Entrada

Los traders novatos obsesionan con el momento de entrada. "¿Debería comprar a 4,521.25 o 4,521.50?" No importa. Lo que importa es la configuración: ¿La tendencia está a tu favor? ¿Hay un punto de invalidación claro? ¿El riesgo/recompensa es al menos 2:1?

Los desarrolladores novatos obsesionan con la elección tecnológica. "¿Debería usar Prisma o Drizzle?" No importa. Lo que importa es la arquitectura: ¿Tu modelo de datos es sólido? ¿Tus APIs están bien diseñadas? ¿Puedes cambiar de opinión después sin reescribir todo?

La herramienta específica es la entrada. La arquitectura es la configuración. Domina la configuración y la elección de herramienta se vuelve un error de redondeo.

## Lección 3: Documenta Todo

Llevo un diario de trading. Cada operación: entrada, salida, razonamiento, emociones, contexto del mercado, resultado, lecciones. Después de 6 meses, surgen patrones. Opero en exceso los lunes. Mantengo perdedores demasiado tiempo cuando estoy cansado. Aumento el tamaño demasiado agresivamente después de una racha ganadora.

Ahora mantengo el equivalente en ingeniería: registros de decisiones arquitectónicas (ADRs). Cada decisión importante: qué elegí, qué rechacé, por qué, qué cambiaría. Después de un año de desarrollo de Nexural, los patrones son claros. Invierto poco en manejo de errores al principio. Sobrediseño la autenticación. Subestimo consistentemente la complejidad de las migraciones de base de datos.

Autoconocimiento a través de la documentación. Misma práctica, diferente dominio.

## Lección 4: Los Supervivientes Son Aburridos

Los traders más exitosos que conozco son aburridos. Operan las mismas 2-3 configuraciones, día tras día, con los mismos parámetros de riesgo. Sin jugadas YOLO. Sin "me siento con suerte hoy". Solo ejecución consistente de una ventaja probada.

Los mejores códigos base en los que he trabajado también son aburridos. Patrones consistentes. Estructuras de archivos predecibles. Convenciones de nomenclatura estándar. Sin trucos ingeniosos. Sin "encontré una forma genial de hacer esto". Solo código confiable y mantenible que hace lo que dice.

Aburrido está subestimado en ambas disciplinas.

## Lección 5: Estás Operando Contra Ti Mismo

Los mercados no se preocupan por ti. No están en tu contra. Cada pérdida es consecuencia de tus decisiones, no de la malicia del mercado.

El software tampoco se preocupa por ti. Los bugs no son personales. Las caídas de producción no son el universo castigándote. Son consecuencias de decisiones — generalmente tomadas semanas atrás bajo restricciones diferentes.

Tomar responsabilidad (en trading lo llaman "ser responsable de tu P&L") es lo que separa a los profesionales de los aficionados en ambos campos.

## La Meta-Lección

Tanto el trading como la ingeniería de software son disciplinas de gestionar complejidad bajo incertidumbre. En trading, la incertidumbre es la dirección del mercado. En software, la incertidumbre es el comportamiento del usuario, la carga del sistema y los casos límite.

Las herramientas son diferentes. Los principios son idénticos:
- Gestiona el riesgo primero, busca recompensa después
- Ten un plan antes de ejecutar
- Documenta lo que pasó y aprende de ello
- Sé consistente, no ingenioso
- Sobrevive el tiempo suficiente para acumular tu ventaja

Construyo mejor software porque hago trading. Y hago mejor trading porque construyo software. La polinización cruzada es real.
