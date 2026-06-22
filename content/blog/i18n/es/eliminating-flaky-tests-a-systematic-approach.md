---
title: "Eliminando Pruebas Inestables: Un Enfoque Sistemático"
excerpt: "Cómo reduje la tasa de inestabilidad de un conjunto de pruebas del 10% a menos del 1%: lógica de reintento, aislamiento de pruebas, datos deterministas y los patrones que hacen que las pruebas sean confiables."
sourceSlug: eliminating-flaky-tests-a-systematic-approach
locale: es
sourceHash: b780b5a56a15f8e6
machineTranslated: true
---

# Eliminando Pruebas Inestables: Un Enfoque Sistemático

Una prueba inestable es una prueba que a veces pasa y a veces falla sin ningún cambio en el código. Con una tasa de inestabilidad del 10%, los desarrolladores dejan de confiar en el conjunto de pruebas. Al 20%, dejan de ejecutarlo.

He llevado conjuntos de pruebas del 10% de inestabilidad a menos del 1%. Aquí está el enfoque sistemático.

## Paso 1: Medir la Tasa de Inestabilidad

No se puede arreglar lo que no se mide. Rastrea la inestabilidad a lo largo del tiempo:
