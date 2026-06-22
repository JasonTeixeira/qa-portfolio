---
title: "Supabase 生产环境实战：185 张表前我希望知道的事"
excerpt: "在生产环境运行 Supabase 一年、管理 185 张表后，这是一份诚实的评价——哪些令人惊叹，哪些令人沮丧，以及什么差点让我放弃。"
sourceSlug: supabase-in-production-what-i-wish-i-knew-before-185-tables
locale: zh
machineTranslated: true
---

# 生产环境中的 Supabase：185 张表之前我希望知道的事

我在生产环境中运行 Supabase 已超过一年。185 张表。69 个 API 端点。Stripe webhooks。实时订阅。Discord 机器人数据。交易分析。

这不是一篇"入门"教程。这是大规模使用后的真实体验。

## 真正令人惊叹之处

### 行级安全彻底改变一切

RLS 是 Supabase 的杀手级功能，但大多数人并未充分利用它。无需在每个 API 端点中编写授权检查，数据库直接强制执行访问控制：
