---
title: "Manejo de Errores que Respeta a tus Usuarios"
excerpt: "A tus usuarios no les importan los rastreos de pila. Les importa qué salió mal y qué hacer a continuación. Así es como diseño experiencias de error que ayudan en lugar de frustrar."
sourceSlug: error-handling-that-respects-your-users
locale: es
machineTranslated: true
---

# Manejo de Errores que Respeta a tus Usuarios

La mayoría del manejo de errores está escrito para el ingeniero que ya conoce el sistema.

Eso está al revés.

Al usuario no le importa que un webhook de Stripe haya expirado, que una política de Supabase haya rechazado la fila o que un proveedor de modelos haya devuelto un 429. Le importan tres cosas:

- qué pasó
- si su trabajo está a salvo
- qué puede hacer a continuación

Si la interfaz no puede responder esas preguntas, el mensaje de error no está ayudando. Solo está filtrando detalles de implementación.

:::proof-note title="El estándar que uso" label="regla del operador"
Un estado de error es parte de la superficie del producto. Debe diseñarse con el mismo cuidado que el camino feliz porque a menudo es el momento en que la confianza se protege o se pierde.
:::

## Empieza por la tarea del usuario, no por la excepción

El primer borrador de un mensaje de error suele sonar como la ruta del código:

> Error al crear la sesión de pago.

Puede ser cierto, pero no es útil. Una versión mejor comienza con la intención del usuario:

> No pudimos abrir el pago. Los detalles de tu proyecto se guardaron. Intenta de nuevo, o reserva una llamada y lo terminaremos manualmente.

Ese mensaje cumple cuatro funciones:

- nombra la acción fallida
- confirma si los datos se guardaron
- da un siguiente paso
- evita culpar al usuario

El error interno aún puede registrarse con el proveedor, el código de estado, el id de solicitud y el stack trace. El usuario no necesita todo eso.

## Separa el texto para el usuario de la telemetría de ingeniería

La superficie del producto y la superficie de observabilidad no deberían llevar la misma carga.

:::system-diagram title="Flujo de error respetuoso" label="superficie -> telemetría" nodes="Acción del usuario,Límite de error,Texto para el usuario,Telemetría"
El usuario ve un camino de recuperación claro. El sistema mantiene el stack trace, el id de solicitud, la respuesta del proveedor y el enrutamiento de alertas para el operador.
:::

En producción, quiero dos salidas de la misma falla:

- un mensaje legible para humanos en la página
- un evento legible para máquinas en logs, analíticas y alertas

El texto para el usuario debe ser tranquilo y específico. La telemetría puede ser densa y fea si es necesario. Mezclar ambos crea logs inútiles o interfaces hostiles.

## Los buenos estados de error responden cinco preguntas

Cuando reviso un estado de error, lo paso por esta lista de verificación.

:::checklist title="Lista de verificación de estados de error" label="qa de ux"
- ¿Dice qué acción falló?
- ¿Dice si los datos del usuario están a salvo?
- ¿Ofrece un siguiente paso realista?
- ¿Evita exponer secretos, stack traces o internos del proveedor?
- ¿La telemetría captura suficiente detalle para que el operador lo depure?
:::

Si la respuesta es no, el estado no está terminado.

Por ejemplo, un fallo en un formulario de contacto no debería decir `500 Error Interno del Servidor`. Debería decir algo más cercano a:

> No pudimos enviar el mensaje. Tu navegador se quedó en esta página, así que no se perdió nada. Intenta de nuevo o envía los detalles del proyecto directamente por correo electrónico.

Luego, los logs del servidor deberían contener la causa real: fallo de validación, tiempo de espera de Resend, fallo de inserción en Supabase o rechazo del webhook.

## Diseña la alternativa antes de que el sistema falle

Los equipos suelen agregar estados alternativos después del primer incidente en producción. Eso es costoso porque la falla ya es pública.

Para flujos importantes, me gusta definir la alternativa mientras construyo la funcionalidad:

| Flujo | Alternativa para el usuario | Señal para el operador |
|---|---|---|
| Pago | Ruta de guardado, ofrecer enlace de reserva | error del proveedor de pago con metadatos de sesión |
| Formulario de contacto | Mantener mensaje en pantalla, mostrar correo directo | error de captura de lead con fuente y forma del payload |
| Generación de IA | Preservar prompt, ofrecer reintento | proveedor, modelo, latencia y metadatos de tokens |
| Carga de archivos | Mostrar límite de archivo y ruta de reintento | error de almacenamiento, tamaño, tipo MIME, id de organización |

La alternativa no necesita ser elegante. Necesita preservar el impulso.

## No hagas que todos los errores suenen igual

Los mensajes genéricos hacen que el producto se sienta descuidado:

- Algo salió mal.
- Intenta de nuevo más tarde.
- Ocurrió un error inesperado.

A veces son aceptables como captura final, pero no deberían ser el único lenguaje de error en el producto.

Diferentes fallos necesitan diferentes caminos de recuperación:

- error de validación: muestra el campo exacto y el formato esperado
- error de permiso: explica qué rol o cuenta se requiere
- límite de tasa: indica cuándo reintentar u ofrece una acción más ligera
- fallo de dependencia: preserva el trabajo del usuario y muestra una ruta alternativa
- fallo de acción destructiva: indica claramente qué no cambió

El objetivo no es hacer que el sistema parezca perfecto. El objetivo es hacer que el usuario se sienta orientado cuando no lo es.

:::scorecard title="Calidad del texto de error" label="tarjeta de puntuación"
Patrón | Débil | Fuerte
Validación | Entrada inválida | Usa un correo laboral o elimina caracteres no soportados
Fallo del proveedor | Error en el pago | El pago no se abrió. Los detalles de tu proyecto están guardados.
Permiso | No autorizado | Necesitas acceso de administrador para cambiar la configuración de facturación
Límite de tasa | Demasiadas solicitudes | Espera 60 segundos antes de ejecutar otra auditoría
Desconocido | Algo salió mal | No pudimos completar esta acción. Tu borrador sigue aquí.
:::

## El operador necesita una interfaz diferente

El texto respetuoso para el usuario solo funciona si el operador sigue obteniendo la evidencia real.

Eso significa registrar:

- ruta y acción
- id de solicitud o id de traza
- id de usuario/organización cuando esté disponible
- proveedor y código de estado
- forma segura del payload
- tiempos
- número de reintentos

También significa no registrar secretos, tokens sin procesar, detalles de tarjetas de pago, documentos privados o prompts completos cuando esos prompts puedan contener datos del cliente.

Un buen manejo de errores no es un registro más suave. Es una separación más nítida.

## El patrón que intento enviar a producción

Para cada acción importante, quiero esta forma:

1. Validar temprano y mostrar orientación a nivel de campo.
2. Envolver la acción del servidor/ruta de la API en un manejo de errores estructurado.
3. Devolver un mensaje de usuario estable y un código de máquina estable.
4. Registrar el contexto completo seguro para el operador.
5. Rastrear el fallo como un evento de producto si afecta la conversión.
6. Preservar la entrada del usuario siempre que sea posible.

Eso no es un trabajo glamoroso, pero es parte de la sensación premium. El sitio que guarda tu trabajo y te dice qué hacer a continuación se siente más confiable que el sitio que muestra un cuadro rojo y te hace empezar de nuevo.

:::offer-cta title="¿Quieres auditar las rutas de fallo?" label="siguiente paso" href="/tools/route-finder" cta="Encuentra tu ruta"
Usa el Route Finder para decidir si tu producto necesita una construcción de estudio, un sprint de auditoría, un alcance de automatización o un camino de academia.
:::
