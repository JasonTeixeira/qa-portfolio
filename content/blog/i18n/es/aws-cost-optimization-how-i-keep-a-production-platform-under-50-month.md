---
title: "Optimización de costos en AWS: Cómo mantengo una plataforma de producción por menos de $50/mes"
excerpt: "La plataforma Nexural funciona en AWS con Vercel, Supabase y servicios específicos de AWS. Así es como mantengo los costos por debajo de $50/mes para una plataforma con 185 tablas y datos en tiempo real."
sourceSlug: aws-cost-optimization-how-i-keep-a-production-platform-under-50-month
locale: es
machineTranslated: true
---

# Optimización de Costos en AWS: Cómo Mantengo una Plataforma de Producción por Menos de $50/Mes

El ecosistema Nexural tiene 185 tablas de base de datos, 69 endpoints de API, datos de mercado en tiempo real, funciones impulsadas por IA y un panel de calidad en vivo. Mi factura de AWS es de menos de $50/mes.

Así es como lo logro.

## La Arquitectura que Ahorra Dinero

**Principio: usar servicios administrados en sus niveles gratuitos/económicos en lugar de ejecutar tu propia infraestructura.**

| Servicio | Qué Hace | Costo Mensual |
|---------|-------------|-------------|
| Vercel (Hobby → Pro) | Hosting de Next.js, funciones edge | $0-20 |
| Supabase (Free → Pro) | PostgreSQL, Auth, Tiempo real | $0-25 |
| AWS S3 | Datos de telemetría, artefactos | $0.02 |
| AWS Lambda | Proxy de API, ingesta de telemetría | $0 (nivel gratuito) |
| AWS API Gateway | Endpoint HTTP de Lambda | $0 (nivel gratuito) |
| AWS CloudFront | CDN + WAF | $0 (nivel gratuito) |
| GitHub Actions | CI/CD, trabajos programados | $0 (gratuito para repos públicos) |

**Total: ~$25-45/mes** para una plataforma de producción.

## Los Trucos

### 1. Supabase en Lugar de RDS

Una instancia Pro de Supabase cuesta $25/mes e incluye:
- PostgreSQL 15 con 8GB de almacenamiento
- Seguridad a nivel de fila
- Suscripciones en tiempo real
- Autenticación integrada
- Copias de seguridad automáticas

Una instancia RDS equivalente (db.t3.micro) cuesta $15/mes pero necesitas gestionar copias de seguridad, autenticación y tiempo real por tu cuenta. Agrega esos servicios y estarás en $60+.

### 2. Lambda para Cargas de Trabajo Irregulares

La API de ingesta de telemetría maneja 0 solicitudes la mayor parte del tiempo, luego explota durante las ejecuciones de CI. Lambda es perfecto: $0 cuando está inactivo, centavos durante los picos.
