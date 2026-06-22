---
title: "Terraform Module Patterns: How I Structure IaC for Reuse"
excerpt: "Opinionated Terraform module patterns — consistent variable naming, output contracts, testing with Terratest, and the module structure that works across teams."
sourceSlug: terraform-module-patterns-how-i-structure-iac-for-reuse
locale: ru
machineTranslated: true
---

# Шаблоны модулей Terraform: как я структурирую IaC для повторного использования

После создания AWS Landing Zone и нескольких инфраструктурных проектов у меня сформировались определённые взгляды на то, как писать модули Terraform, которые действительно могут использовать другие люди.

## Структура модуля

Каждый модуль придерживается следующей структуры:

\
