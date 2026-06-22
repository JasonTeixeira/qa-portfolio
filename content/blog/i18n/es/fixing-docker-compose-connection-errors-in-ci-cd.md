---
title: "Solucionando errores de conexión de Docker Compose en CI/CD"
excerpt: "Pasé 4 horas depurando errores de 'Conexión rechazada' en Jenkins. Esto es lo que aprendí sobre redes Docker en pipelines de CI."
sourceSlug: fixing-docker-compose-connection-errors-in-ci-cd
locale: es
sourceHash: 8e0431f892a3afac
machineTranslated: true
---

# Solucionando Errores de Conexión en Docker Compose en CI/CD

Imagina esto: tu configuración de Docker Compose funciona perfectamente en tu máquina local. Subes los cambios a CI y, de repente, todas las pruebas de integración fallan con `Connection refused`.

El contenedor de la base de datos está "en ejecución". El contenedor de la API está "saludable". El proceso de prueba comienza. Luego no puede conectarse al servicio que necesita.

Este fallo parece aleatorio hasta que recuerdas una cosa: la red Docker local y la red Docker de CI no son el mismo entorno.

:::proof-note title="La lección real" label="nota ci"
La mayoría de los errores de conexión de Docker Compose en CI no son problemas de Docker. Son problemas de temporización, nombre de host, puerto o límites de red que el desarrollo local oculta.
:::

## La configuración local te engaña

En tu máquina, podrías conectarte a Postgres en `localhost:5432`.

Dentro de una red de Compose, otro contenedor normalmente debería conectarse a `postgres:5432`, donde `postgres` es el nombre del servicio.

En CI, el ejecutor de pruebas puede estar:

- dentro de la red de Compose
- fuera de la red de Compose en el host
- dentro de un contenedor de servicio de CI
- dentro de un ejecutor Docker anidado

Esos cuatro casos usan diferentes nombres de host.

Por eso una cadena de conexión puede ser "correcta" localmente y fallar en el pipeline.

## Primero, identifica dónde se ejecuta el proceso de prueba

Antes de cambiar puertos, hazte una pregunta:

> ¿El comando de prueba se ejecuta dentro de un servicio de Compose o en el host de CI?

Si las pruebas se ejecutan dentro de Compose:

```txt
DATABASE_URL=postgres://usuario:contraseña@postgres:5432/app
```

Si las pruebas se ejecutan en el host de CI y Compose publicó el puerto:

```txt
DATABASE_URL=postgres://usuario:contraseña@127.0.0.1:5432/app
```

Si las pruebas se ejecutan en un contenedor de CI separado, es posible que ninguna funcione hasta que se configure la red de servicios de la plataforma de CI.

:::system-diagram title="Decisión de red en CI" label="compose -> pruebas" nodes="Servicio Compose,Red,Ejecutor de pruebas,Base de datos"
El nombre de host correcto depende de dónde se encuentre el ejecutor de pruebas. Los nombres de servicio funcionan dentro de la red de Compose. Los puertos publicados en localhost funcionan desde el host.
:::

## No confíes en `depends_on` como indicador de disponibilidad

`depends_on` puede controlar el orden de inicio. No garantiza que Postgres, Redis o tu aplicación estén listos para aceptar conexiones.

La versión incorrecta común:

```yaml
services:
  api:
    depends_on:
      - postgres
```

Eso solo significa que el contenedor `postgres` se inicia antes que `api`. No significa que las migraciones se hayan ejecutado. No significa que TCP esté listo. No significa que la base de datos haya aceptado la autenticación.

Usa verificaciones de salud o un script de espera explícito.

```yaml
services:
  postgres:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 12

  api:
    depends_on:
      postgres:
        condition: service_healthy
```

Eso aún no resuelve todas las plataformas de CI, pero elimina la condición de carrera más común.

## Revisa las cuatro clases de fallo

Cuando veo `Connection refused`, trabajo en este orden.

:::checklist title="Lista de verificación de Docker Compose en CI" label="orden de depuración"
- Confirmar la ubicación del ejecutor de pruebas: host, servicio Compose o contenedor de servicio CI
- Confirmar el nombre de host: nombre del servicio vs 127.0.0.1 vs alias del servicio de la plataforma
- Confirmar que el puerto publicado esté realmente mapeado
- Confirmar que la dependencia esté saludable antes de que comiencen las pruebas
- Imprimir las variables de entorno resueltas en CI sin filtrar secretos
- Ejecutar una pequeña verificación TCP antes de la suite de pruebas completa
:::

La verificación TCP es aburrida pero útil:

```bash
node -e "require('net').connect(5432, process.env.DB_HOST).on('connect', () => { console.log('ok'); process.exit(0) }).on('error', e => { console.error(e.message); process.exit(1) })"
```

Si eso falla, tu suite de pruebas de la aplicación no es lo que debes depurar todavía.

## Usa diferentes cadenas de conexión para diferentes límites

Un patrón limpio es hacer explícito el límite:

```env
DATABASE_URL_INTERNAL=postgres://app:app@postgres:5432/app
DATABASE_URL_HOST=postgres://app:app@127.0.0.1:5432/app
```

Luego, tu trabajo de CI elige la correcta según dónde se ejecute el comando.

Esto es menos mágico que intentar que una sola URL funcione en todas partes.

:::scorecard title="Verificación de cordura de cadena de conexión" label="tarjeta de puntuación"
Ubicación del ejecutor | Nombre de host | Fuente del puerto
Dentro de Compose | postgres | Puerto del contenedor
Host de CI | 127.0.0.1 | Puerto publicado
Contenedor de servicio CI | Alias del servicio | Configuración del servicio de la plataforma
BD remota | Host de BD público/privado | Lista de permitidos de red
:::

## Mantén las migraciones separadas de la disponibilidad

Una base de datos puede estar saludable antes de que el esquema esté listo.

Si tu aplicación necesita migraciones, conviértelo en un paso explícito del pipeline:

```bash
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm test
```

O ejecuta las pruebas dentro de un servicio que espere ambas condiciones:

- salud de la base de datos
- migraciones completadas
- datos de semilla cargados

De lo contrario, obtienes una clase peor de fallo: errores de prueba intermitentes que parecen errores de la aplicación pero que en realidad son condiciones de carrera en la configuración.

## La salida de depuración que quiero en cada fallo de CI

No filtres secretos. Sí imprime la forma del entorno.

Salida útil:

- Servicios de Docker Compose y su estado
- registros del contenedor para la dependencia
- host y puerto resueltos, con la contraseña oculta
- nombres de red
- estado de la verificación de salud
- estado de la migración

Ejemplo:

```bash
docker compose ps
docker compose logs --tail=80 postgres
docker network ls
```

El objetivo es hacer que el próximo fallo sea diagnosticable en una sola pasada.

## La lección para producción

El dolor de la red en CI es un adelanto del dolor de integración en producción.

Si tus pruebas dependen de la esperanza, probablemente tus despliegues también. Haz explícitos los límites del servicio. Agrega verificaciones de salud. Separa la disponibilidad de las migraciones. Registra los hechos correctos.

Así es como conviertes "funciona en mi máquina" en algo que un pipeline pueda demostrar.

:::offer-cta title="¿Necesitas limpiar el pipeline?" label="próximo paso" href="/tools/route-finder" cta="Encuentra tu ruta"
Usa el diagnóstico para decidir si esto es un sprint de auditoría enfocado, una construcción de plataforma o un camino de academia que puedas recorrer por tu cuenta.
:::
