---
title: "Lo que aprendí construyendo en público como ingeniero solitario"
excerpt: "Un año construyendo el ecosistema Nexural, operando futuros, escribiendo un libro y documentando todo. Los aciertos, los fracasos y lo que le diría a alguien que empieza hoy."
sourceSlug: what-i-learned-building-in-public-as-a-solo-engineer
locale: es
sourceHash: 8efdb4e4031bcb97
machineTranslated: true
---

# Lo que Aprendí Construyendo en Público como Ingeniero Solitario

Hace un año, dejé mi puesto en HighStrike y fundé Sage Ideas LLC. Desde entonces, he construido una plataforma fintech con 185 tablas de base de datos, un bot de Discord con IA, un sistema de señales de trading con ML, un libro de 120,000 palabras sobre trading y este sitio portafolio.

Esto es lo que aprendí.

## La Soledad es Real

La ingeniería en solitario significa:
- Sin revisiones de código (revisas tu propio código)
- Sin discusiones de arquitectura (discutes contigo mismo)
- Sin nadie que detecte tus puntos ciegos (los descubres en producción)
- Sin nadie con quien celebrar victorias (haces push a main y sigues adelante)

La solución: empecé a documentar mis decisiones. Cada decisión importante de arquitectura tiene un archivo markdown explicando qué elegí y por qué. Es una conversación con mi yo futuro — y ahora es contenido para mi portafolio.

## Despliega Semanalmente, No Mensualmente

Mis primeros 3 meses, construí durante 4 semanas antes de desplegar. Encontraba bugs, me daba cuenta de que había construido lo incorrecto y perdía días refactorizando.

Ahora despliego cada semana. A veces cada día. Los despliegues pequeños significan:
- Menos riesgo por despliegue
- Retroalimentación más rápida
- Reversiones más fáciles
- Progreso visible (crucial para la motivación)

## El 80/20 de la Ingeniería en Solitario

**El 20% del trabajo que produce el 80% del valor:**
- Diseño del esquema de base de datos (hazlo bien y todo lo demás es más fácil)
- Definición de contratos de API (los esquemas Zod detectan el 90% de los bugs de integración)
- Configuración de CI/CD (despliegues automatizados = despliegas más)
- Monitoreo de errores (saber de los bugs antes de que los usuarios los reporten)

**El 80% del trabajo que produce el 20% del valor:**
- UI perfecta al píxel (los usuarios se preocupan por la función, no por el peso de la fuente)
- Optimización de rendimiento antes de tener usuarios
- Escribir tests para código que cambiará la próxima semana
- Elegir el stack tecnológico "perfecto"

## La Realidad Financiera

Soy un trader activo de futuros. Los ingresos del trading financian la construcción. Este es un lujo que la mayoría de los constructores solitarios no tienen.

Sin ingresos de trading, habría necesitado:
- Mínimo 6 meses de ahorros
- Un camino claro de monetización antes de construir
- Clientes que paguen antes de construir funcionalidades

Construir en público sin presión de ingresos es un privilegio. Construir en público CON presión de ingresos es emprendimiento. Requieren estrategias diferentes.

## Lo Que Realmente Me Consiguió Trabajo (Entrevistas e Interés)

Después de construir todo esto, esto es lo que realmente les importa a los gerentes de contratación y clientes potenciales:

1. **"¿Construiste una plataforma con 185 tablas?"** — La escala impresiona. No el número en sí, sino el hecho de que lo diseñé y gestioné en solitario.

2. **"¿Operas los mismos instrumentos que analiza tu software?"** — La experiencia en el dominio es rara. La mayoría de los desarrolladores fintech no usan sus propios productos.

3. **"¿Dónde está la demo en vivo?"** — El panel de calidad en mi sitio portafolio ha iniciado más conversaciones que mi currículum. La gente puede verlo funcionando.

4. **"¿Escribiste un libro de 120K palabras?"** — Esto señala compromiso, pensamiento profundo y habilidades de comunicación. Nadie escribe 120K palabras casualmente.

5. **"Muéstrame el GitHub"** — Quieren ver código real, commits reales, pipelines de CI reales. No una página de portafolio pulida — el repositorio real.

## Lo Que Le Diría a Alguien Que Empiece Hoy

1. **Elige una cosa y despliégala.** No construyas una "plataforma". Construye una sola funcionalidad, despliégala y muéstrasela a una persona. Luego construye la siguiente funcionalidad.

2. **Documenta obsesivamente.** Tu documentación es tu portafolio. Tus mensajes de commit son tu registro de trabajo. Tus documentos de arquitectura son tus casos de estudio.

3. **Construye lo que usas.** Construí herramientas de trading porque hago trading. Construí frameworks de testing porque hago testing. La convicción se nota cuando construyes para ti mismo.

4. **No optimices antes de tener usuarios.** Despliega la versión fea. Obtén retroalimentación. Luego púlela.

5. **Tu portafolio ES el proyecto.** El meta-proyecto de mantener un sitio portafolio con SLOs, simulacros de incidentes y artefactos de evidencia es en sí mismo una prueba de madurez en ingeniería.

## Un Año Después

He construido más en un año en solitario de lo que muchos equipos construyen en dos. No porque sea más rápido — porque no tengo reuniones, ni planning poker, ni ceremonias de sprint, ni sobrecarga organizativa.

El intercambio es soledad, dudas sobre uno mismo y la pregunta constante: "¿Es esto suficientemente bueno?" La respuesta es siempre "despliégalo y descúbrelo".
