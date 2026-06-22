---
title: "GitHub OIDC → AWS (Keine langlebigen Schlüssel): Cloud-Automatisierung richtig gemacht"
excerpt: "So verwenden Sie GitHub Actions OIDC, um eine AWS IAM-Rolle zu übernehmen und Artefakte bereitzustellen/hochzuladen, ohne AWS-Schlüssel zu speichern. Enthält IAM mit minimalen Berechtigungen, Vertrauensrichtlinien-Muster und Tipps zur Fehlerbehebung."
sourceSlug: github-oidc-aws-no-long-lived-keys-cloud-automation-the-right-way
locale: de
sourceHash: bfc0536b90edf6b9
machineTranslated: true
---

# GitHub OIDC → AWS (Keine langlebigen Schlüssel): Cloud-Automatisierung richtig gemacht

Statische AWS-Schlüssel in CI sind ein Sicherheitsrisiko.

Wenn Sie eine Cloud-Automatisierung wünschen, die skaliert (und Sicherheitsüberprüfungen besteht), verwenden Sie **OIDC-basierte Föderation**:

- GitHub Actions stellt ein kurzlebiges Identitätstoken (OIDC) aus
- AWS STS tauscht es gegen kurzlebige AWS-Anmeldeinformationen ein
- Ihr Workflow übernimmt eine Rolle mit minimalen Berechtigungen und erledigt die Arbeit

Dieses Portfolio verwendet dasselbe Muster, um den **Cloud-Telemetriemodus** (AWS S3) zu unterstützen, ohne jemals langlebige Anmeldeinformationen einzubetten.

## Die Architektur
