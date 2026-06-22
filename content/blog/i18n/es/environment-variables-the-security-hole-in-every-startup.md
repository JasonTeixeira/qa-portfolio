---
title: "Variables de Entorno: El Agujero de Seguridad en Cada Startup"
excerpt: "Tu archivo .env tiene la contraseña de tu base de datos, la clave secreta de Stripe y las credenciales de AWS. Está en un mensaje de Slack, en la laptop de un desarrollador y probablemente en alguna imagen de Docker. Arreglemos eso."
sourceSlug: environment-variables-the-security-hole-in-every-startup
locale: es
machineTranslated: true
---

# Variables de Entorno: El Agujero de Seguridad en Cada Startup

Auditoría rápida: ¿dónde está tu contraseña de base de datos ahora mismo?

Si respondiste "archivo .env en la raíz del repositorio" — estás en la mayoría. Si respondiste "también en un mensaje de Slack al nuevo empleado, una captura de pantalla en Confluence, y hardcodeada en esa función Lambda que escribió Dave antes de irse" — estás siendo honesto.

Las variables de entorno son la infraestructura más peligrosa en la mayoría de las startups porque todos las tratan como algo secundario.

## Los Errores Comunes

### Error 1: .env en el Control de Versiones

Lo he visto en repositorios de producción en empresas reales. Un \
