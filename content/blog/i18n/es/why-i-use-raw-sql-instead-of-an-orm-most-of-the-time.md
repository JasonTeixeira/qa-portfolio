---
title: "Por qué uso SQL puro en lugar de un ORM (la mayoría del tiempo)"
excerpt: "Los ORM son geniales hasta que dejan de serlo. Después de depurar consultas generadas que tardaban 30 segundos en una base de datos de 185 tablas, cambié a SQL puro para las rutas críticas. Aquí cuándo tiene sentido cada uno."
sourceSlug: why-i-use-raw-sql-instead-of-an-orm-most-of-the-time
locale: es
sourceHash: 8704afb8dd6233ff
machineTranslated: true
---

# Por Qué Uso SQL Puro en Lugar de un ORM (La Mayoría del Tiempo)

Esto va a ser polémico, así que déjame empezar con la aclaración: los ORM están bien. Prisma, SQLAlchemy, Drizzle — son buenas herramientas creadas por personas inteligentes. Yo las uso.

Pero para la plataforma Nexural — 185 tablas, joins complejos, vistas materializadas, seguridad a nivel de fila — SQL puro fue la decisión correcta para las rutas críticas. He aquí por qué.

## El Momento en que Cambié

Estaba usando Prisma. El panel cargaba en 200ms en local. En producción con datos reales, tardó 4.2 segundos.

Ejecuté \\\
