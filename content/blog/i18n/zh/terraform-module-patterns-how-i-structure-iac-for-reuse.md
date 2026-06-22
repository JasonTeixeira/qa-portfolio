---
title: "Terraform 模块模式：如何构建可复用的基础设施即代码"
excerpt: "有主见的 Terraform 模块模式——一致的变量命名、输出约定、使用 Terratest 进行测试，以及跨团队适用的模块结构。"
sourceSlug: terraform-module-patterns-how-i-structure-iac-for-reuse
locale: zh
machineTranslated: true
---

# Terraform 模块模式：如何构建可复用的基础设施即代码

在构建了 AWS Landing Zone 和多个基础设施项目之后，我对于如何编写他人真正能用的 Terraform 模块形成了一些见解。

## 模块结构

每个模块都遵循以下结构：
