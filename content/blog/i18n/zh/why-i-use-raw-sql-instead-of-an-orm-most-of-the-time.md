---
title: "为何我（多数时候）用原生SQL而非ORM"
excerpt: "ORM虽好，但并非万能。在调试一个185表数据库上耗时30秒的生成查询后，我将热路径切换为原生SQL。以下是对各自适用场景的分析。"
sourceSlug: why-i-use-raw-sql-instead-of-an-orm-most-of-the-time
locale: zh
machineTranslated: true
---

# 为何我多数时候选择原生SQL而非ORM

这可能会引发争议，所以先声明：ORM本身没有问题。Prisma、SQLAlchemy、Drizzle——这些都是优秀开发者打造的好工具，我也在使用它们。

但对于Nexural平台——185张表、复杂联表查询、物化视图、行级安全——在关键路径上选择原生SQL是正确的决定。原因如下。

## 转变的契机

当时我在用Prisma。本地环境仪表盘加载只需200毫秒，但在生产环境面对真实数据时，耗时长达4.2秒。

我运行了
