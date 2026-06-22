---
title: "La autenticación es más difícil de lo que crees"
excerpt: "He implementado autenticación 4 veces en diferentes proyectos. Cada vez pensé que me llevaría 2 días. Cada vez me llevó 2 semanas. Aquí está el porqué, y qué haría diferente."
sourceSlug: authentication-is-harder-than-you-think
locale: es
sourceHash: e2ed3ac31387d42f
machineTranslated: true
---

# La Autenticación es Más Difícil de lo que Crees

Cada plan de proyecto que he escrito tiene una partida: "Autenticación — 2 días."

Cada retrospectiva de proyecto tiene una nota: "La autenticación tomó 2 semanas."

He construido sistemas de autenticación 4 veces hasta ahora. Cada vez, lo subestimo. Aquí está el porqué, y lo que finalmente aprendí.

## El Iceberg

Lo que crees que es la autenticación:
- Formulario de inicio de sesión
- Almacenar un token
- Verificar si el token es válido
- Listo

Lo que realmente es la autenticación:
- Formulario de inicio de sesión (email/contraseña + OAuth + enlaces mágicos + MFA?)
- Hash de contraseñas (bcrypt, argon2, ¿qué factor de costo?)
- Gestión de sesiones (JWT vs cookie de sesión vs ¿ambos?)
- Renovación de tokens (renovación silenciosa, rotación, revocación)
- Protección CSRF (cookies del mismo sitio, token de doble envío)
- Límite de velocidad (en inicio de sesión, en registro, en restablecimiento de contraseña)
- Flujo de restablecimiento de contraseña (generación de token, caducidad, uso único)
- Verificación de email (token, lógica de reenvío, ¿qué pasa si cambian de email?)
- Bloqueo de cuenta (¿cuántos intentos? ¿Cuál es el flujo de desbloqueo?)
- Acceso basado en roles (admin vs usuario vs moderador)
- Gestión de claves API (para acceso programático)
- Invalidación de sesión al cambiar la contraseña
- "Recordarme" vs "solo esta sesión"
- Notificación de inicio de sesión desde un nuevo dispositivo
- Registro de auditoría (quién inició sesión, cuándo, desde dónde)

Eso son 15+ funcionalidades. A 1-2 días cada una, estás mirando un mes.

## Lo Que Hago Ahora: Usar Supabase Auth y Extender

Después de construir autenticación personalizada dos veces y odiar mi vida ambas veces, ahora empiezo con Supabase Auth (o Clerk, o Auth.js). Maneja:

- Email/contraseña con bcrypt
- Proveedores OAuth (Google, GitHub, Discord)
- Tokens JWT con renovación
- Verificación de email
- Restablecimiento de contraseña
- Gestión de sesiones
- Límite de velocidad

Eso es el 80% de la autenticación, manejado por personas que piensan en autenticación a tiempo completo. Me enfoco en el 20% que es específico de mi aplicación:

\\\
