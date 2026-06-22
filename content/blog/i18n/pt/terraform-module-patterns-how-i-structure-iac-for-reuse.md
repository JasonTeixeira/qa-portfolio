---
title: "Padrões de Módulos Terraform: Como Estruturo IaC para Reuso"
excerpt: "Padrões opinativos de módulos Terraform — nomenclatura consistente de variáveis, contratos de saída, testes com Terratest e a estrutura de módulos que funciona entre equipes."
sourceSlug: terraform-module-patterns-how-i-structure-iac-for-reuse
locale: pt
sourceHash: 1fc529dc16591e27
machineTranslated: true
---

# Padrões de Módulos Terraform: Como Estruturo IaC para Reuso

Após construir a AWS Landing Zone e diversos projetos de infraestrutura, desenvolvi opiniões sobre como escrever módulos Terraform que outras pessoas possam realmente usar.

## A Estrutura do Módulo

Todo módulo segue esta estrutura:
