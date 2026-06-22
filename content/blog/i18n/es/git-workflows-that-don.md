---
title: "Flujos de Git que no te harán querer renunciar"
excerpt: "Trunk-based vs GitFlow vs GitHub Flow: he usado los tres. Esto es lo que realmente funciona para desarrolladores solitarios y equipos pequeños, y por qué la mayoría de los flujos de Git son demasiado complicados."
sourceSlug: git-workflows-that-don
locale: es
machineTranslated: true
---

# Flujos de Git Que No Te Harán Querer Renunciar

He trabajado con GitFlow en proyectos grandes. Ramas de funcionalidades, ramas de desarrollo, ramas de release, ramas de hotfix. El gráfico de ramas parecía un mapa de metro. Fusionar una funcionalidad requería un doctorado en resolución de conflictos.

Ahora uso desarrollo basado en tronco. Una rama. Despliego desde main. Mi frecuencia de despliegue pasó de semanal a diaria.

## Por Qué la Mayoría de los Flujos de Git Son Demasiado Complicados

GitFlow fue diseñado para software que se lanza trimestralmente en medios físicos. Si tu proceso de despliegue implica quemar un CD, necesitas ramas de release.

Si despliegas fusionando a main y Vercel/GitHub Actions se encarga del resto, no necesitas el 90% de GitFlow.

## Lo Que Realmente Hago

\\\
