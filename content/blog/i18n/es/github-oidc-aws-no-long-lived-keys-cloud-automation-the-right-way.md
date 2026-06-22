---
title: "GitHub OIDC → AWS (Sin claves de larga duración): Automatización en la nube correcta"
excerpt: "Cómo usar OIDC de GitHub Actions para asumir un rol de IAM de AWS e implementar/subir artefactos sin almacenar claves de AWS. Incluye IAM de mínimo privilegio, patrones de política de confianza y consejos de solución de problemas."
sourceSlug: github-oidc-aws-no-long-lived-keys-cloud-automation-the-right-way
locale: es
sourceHash: bfc0536b90edf6b9
machineTranslated: true
---

# GitHub OIDC → AWS (Sin Claves de Larga Duración): Automatización en la Nube de la Manera Correcta

Las claves estáticas de AWS en CI son un riesgo.

Si deseas una automatización en la nube que escale (y pase una revisión de seguridad), utiliza **federación basada en OIDC**:

- GitHub Actions emite un token de identidad de corta duración (OIDC)
- AWS STS lo intercambia por credenciales AWS de corta duración
- Tu flujo de trabajo asume un rol con mínimos privilegios y realiza el trabajo

Este portafolio utiliza el mismo patrón para admitir el **modo de telemetría en la nube** (AWS S3) sin incrustar nunca credenciales de larga duración.

## La arquitectura
