---
title: "أنماط وحدات Terraform: كيف أنظم البنية التحتية كرمز لإعادة الاستخدام"
excerpt: "أنماط وحدات Terraform الموجهة — تسمية متغيرات متسقة، عقود مخرجات، اختبار باستخدام Terratest، وهيكل الوحدة الذي يعمل عبر الفرق."
sourceSlug: terraform-module-patterns-how-i-structure-iac-for-reuse
locale: ar
machineTranslated: true
---

# أنماط وحدات Terraform: كيف أنظم البنية التحتية ككود (IaC) لإعادة الاستخدام

بعد بناء منطقة الهبوط على AWS (AWS Landing Zone) والعديد من مشاريع البنية التحتية، تكونت لدي آراء حول كيفية كتابة وحدات Terraform التي يمكن للآخرين استخدامها فعليًا.

## هيكل الوحدة

تتبع كل وحدة هذا الهيكل:

\
