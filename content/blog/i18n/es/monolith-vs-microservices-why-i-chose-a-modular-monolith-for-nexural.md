---
title: "Monolito vs Microservicios: Por qué elegí un monolito modular para Nexural"
excerpt: "La plataforma Nexural tiene 7 sistemas pero funciona como un monolito modular, no como microservicios. Aquí está por qué fue la decisión correcta para un ingeniero en solitario, y cuándo lo dividiría."
sourceSlug: monolith-vs-microservices-why-i-chose-a-modular-monolith-for-nexural
locale: es
machineTranslated: true
---

# Monolito vs Microservicios: Por Qué Elegí un Monolito Modular para Nexural

El ecosistema de Nexural tiene 7 sistemas interconectados: panel de trading, bot de Discord, motor de investigación, sistema de alertas, estudio de boletines, rastreador de estrategias y suite de automatización.

Sería natural asumir que esto es una arquitectura de microservicios. No lo es. Es un monolito modular — y fue intencional.

## El Marco de Decisión

Me hice tres preguntas:

1. **¿Cuántos ingenieros?** Uno (yo). Los microservicios multiplican la sobrecarga operativa. Con un solo ingeniero, cada nuevo servicio significa otro pipeline de despliegue, otra configuración de monitoreo, otro modo de fallo que depurar a las 2am.

2. **¿Los módulos necesitan escalado independiente?** Aún no. El panel de trading y el motor de investigación se ejecutan ambos en Vercel. No tienen perfiles de escalado diferentes que justifiquen infraestructura separada.

3. **¿Los módulos necesitan stacks tecnológicos distintos?** Parcialmente — el bot de Discord es Node.js, el sistema de alertas es .NET. Esos son servicios separados por necesidad. Pero las aplicaciones web son todas Next.js/TypeScript y comparten tipos, utilidades y acceso a base de datos.

## Qué Significa "Monolito Modular" en la Práctica

El código base está organizado como un solo repositorio con límites de dominio claros:

\
