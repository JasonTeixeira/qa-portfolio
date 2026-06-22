---
title: "Todo lo que lancé este año (y qué recortaría en retrospectiva)"
excerpt: "Retrospectiva de fin de año: 7 sistemas, 185 tablas, 51 publicaciones de blog, un libro y una carrera de trading. Qué valió la pena, qué no, y qué estoy construyendo a continuación."
sourceSlug: everything-i-shipped-this-year-and-what-i
locale: es
sourceHash: 53f4663a4013d75d
machineTranslated: true
---

# Todo lo que Lancé Este Año (Y Lo Que Recortaría en Retrospectiva)

Hace un año, fundé Sage Ideas LLC con un plan vago: construir herramientas de trading, ofrecer consultoría y ver qué pasaba. Aquí está la retrospectiva honesta.

## Lo Que Lancé

**El Ecosistema Nexural** — 7 sistemas interconectados:
1. Trading Dashboard (185 tablas, 69 APIs, facturación Stripe)
2. Discord AI Engine (30+ comandos, GPT-4o, 12 fases)
3. Research Engine (71+ métricas, análisis de estrategias)
4. Alert System (.NET 8, integración NinjaTrader)
5. Newsletter Studio (canal de contenido automatizado)
6. Strategy Tracker (analíticas de rendimiento)
7. Automation Suite (61 suites de pruebas)

**AlphaStream** — Señales de trading ML (200+ indicadores, 5 modelos)

**RiskRadar** — Plataforma de riesgo de cartera (Ledoit-Wolf, CVaR, optimización)

**Este Portafolio** — El sitio que estás leyendo. SLOs, simulacros de incidentes, dashboard en vivo, 27 artefactos, 51 publicaciones de blog.

**El Libro** — 120,000 palabras sobre trading. 24 capítulos. En fase editorial.

**Trading Activo** — 8 símbolos en NinjaTrader. ES, NQ, CL, GC, y más.

## Lo Que Valió Cada Hora

**La Plataforma Nexural.** Es la pieza central de mi portafolio. Cada entrevista y conversación con clientes comienza con "¿construiste una plataforma con 185 tablas?" La profundidad de este proyecto abre puertas que una docena de proyectos pequeños nunca lo harían.

**El Blog.** 51 publicaciones son un cuerpo de trabajo que indica "esta persona piensa profundamente". Cada publicación es un artefacto compartible. Cuando solicito un empleo, incluyo un enlace a una publicación relevante. Es más convincente que un punto en un currículum.

**La Página de Ingeniería de Plataformas.** SLOs, simulacros de incidentes, comprobantes de seguridad — esta página por sí sola ha cambiado las conversaciones de entrevistas de "¿sabes programar?" a "cuéntame sobre tu experiencia operativa". Ese cambio es la diferencia entre ofertas de nivel medio y senior.

## Lo Que Recortaría

**Nexural Newsletter Studio.** Lo construí, apenas lo usé. La comunidad de trading quería alertas de Discord, no boletines por correo. Debería haber validado la demanda antes de construirlo.

**Múltiples Frameworks de Pruebas de API.** Tengo 3 repositorios que hacen cosas similares: API-Test-Automation-Wireframe, API-Testing-Framework, y la suite de pruebas de API en E-Commerce-Test-Suite. Debería haber construido un framework excelente en lugar de tres mediocres.

**La suite de pruebas de regresión visual.** La integración con Percy es genial, pero el repositorio tiene 1 commit y prueba 1 página. Si hubiera dedicado esas horas a mejorar E-Commerce-Test-Suite, mi mejor repositorio de QA sería aún más sólido.

## Lo Que Aprendí Sobre Construir

**Lanza la primera versión fea.** El primer despliegue del dashboard de Nexural fue vergonzoso. Sin estilo, diseño móvil roto, datos de relleno. Pero estaba en vivo, recibí comentarios, y la versión 2 fue 10 veces mejor gracias a eso.

**Documenta mientras construyes, no después.** Cada sistema que documenté desde el principio fue más fácil de mantener. Cada sistema del que dije "lo documentaré después" se convirtió en una caja misteriosa en 3 meses.

**Tu portafolio ES el trabajo.** Pasé más tiempo en sageideas.dev que en la mayoría de los proyectos de clientes. El retorno de inversión ha sido enorme — interés entrante, conversaciones de entrevistas que comienzan en un nivel más alto, y prueba de madurez operativa que ningún punto de currículum puede igualar.

## Lo Que Construiré Después

Tengo tres cosas en mi hoja de ruta:

1. **Mejorar proyectos existentes.** Los 11 repositorios públicos en mi portafolio necesitan READMEs más sólidos, más commits, mejor CI, y capturas de pantalla reales. Calidad sobre cantidad.

2. **Una biblioteca de módulos Terraform.** Módulos reutilizables de AWS para los patrones que he construido varias veces. Esto llena el vacío de infraestructura en mi portafolio.

3. **Contribuciones de código abierto.** Incluso pequeños PRs a proyectos establecidos añaden credibilidad. Quiero 5-10 contribuciones significativas a proyectos que realmente uso (Next.js, Supabase, Playwright).

## Los Números Honestos

| Métrica | Valor |
|---------|-------|
| Sistemas lanzados | 7 |
| Tablas de base de datos diseñadas | 185 |
| Endpoints de API construidos | 69 |
| Publicaciones de blog escritas | 50 |
| Palabras del libro escritas | 120,000 |
| Certificaciones obtenidas | 9 |
| Suites de pruebas en ejecución | 61 |
| Commits en GitHub | 500+ |
| Ingresos generados | Privado, pero suficiente para financiar la construcción |
| Horas trabajadas | Demasiadas para contarlas |

## El Resultado Final

Construir en público durante un año me enseñó que el trabajo en sí mismo es el portafolio. No una lista de puntos — los sistemas reales en funcionamiento, las publicaciones honestas del blog, la documentación que te sobrevive.

Si estás comenzando tu propia marca de ingeniería, mi consejo es simple: construye cosas reales, documenta obsesivamente, sé honesto sobre los fracasos, y lanza antes de estar listo.

El portafolio perfecto no existe. El que se lanzó, sí.
