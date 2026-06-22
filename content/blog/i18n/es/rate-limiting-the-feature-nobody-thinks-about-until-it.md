---
title: "Límite de tasa: La función en la que nadie piensa hasta que es demasiado tarde"
excerpt: "Tu API funciona perfectamente a 10 solicitudes por segundo. A 10,000, colapsa. Así es como implemento límites de tasa que protegen sin molestar a los usuarios legítimos."
sourceSlug: rate-limiting-the-feature-nobody-thinks-about-until-it
locale: es
sourceHash: c38601b0fe30159a
machineTranslated: true
---

# Límite de Tasa: La Funcionalidad en la que Nadie Piensa Hasta que es Demasiado Tarde

Nadie pone "implementar límite de tasa" en el tablero del sprint. No es una historia de usuario. No mueve una métrica. Producto nunca lo solicita.

Entonces un día, alguien ejecuta un script con 50,000 solicitudes a tu API en 30 segundos y tu base de datos se derrite. O peor aún — el script descontrolado de un solo usuario te cuesta $800 en invocaciones de AWS Lambda durante la noche.

Ambas cosas me pasaron a mí. Ahora el límite de tasa está en mi plantilla inicial.

## Las Tres Capas

Implemento límite de tasa en tres capas, porque cada una detecta diferentes patrones de abuso:

### Capa 1: Edge (CloudFront / Vercel)

\\\
