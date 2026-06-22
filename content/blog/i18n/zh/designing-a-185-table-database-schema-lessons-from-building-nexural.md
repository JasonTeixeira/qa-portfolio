---
title: "设计185表数据库架构：Nexural构建经验谈"
excerpt: "如何为拥有7个互联系统的金融科技平台设计规范化数据库架构。涵盖架构阶段、RLS策略、反规范化权衡及迁移策略。"
sourceSlug: designing-a-185-table-database-schema-lessons-from-building-nexural
locale: zh
sourceHash: 35047aee80b62eef
machineTranslated: true
---

# 设计185张数据库表：构建Nexural的经验教训

当人们听到"185张数据库表"时，往往会认为这是为了复杂而复杂。但每一张表的存在，都是因为业务需求要求它存在。

以下是我设计Nexural schema的方式——哪些决策行之有效，哪些我会改变，以及哪些模式可以扩展。

:::system-diagram title="Nexural schema增长" label="schema -> systems" nodes="Auth,Billing,Trading,Ops"
数据库并非一开始就是庞大的schema。它随着产品领域逐渐落地而增长：用户、订阅、交易工作流、社区功能、分析、研究和运营。
:::

## 基于阶段的Schema设计

我并没有在第一天就设计出185张表。Schema经历了7个阶段的增长，每个阶段新增一个领域：

:::scorecard title="Schema构建阶段" label="scorecard"
阶段 | 领域 | 表数量 | 关键决策
1 | 认证与用户 | 12 | Supabase Auth + 自定义用户资料
2 | 订阅 | 8 | Stripe webhook驱动的状态机
3 | 交易 | 35 | 工具、持仓、信号、自选列表
4 | 社区 | 25 | Discord同步、审核日志、信誉系统
5 | 分析 | 30 | 指标、报告、遥测事件
6 | 研究 | 40 | 策略、指标、回测结果
7 | 运营 | 35 | 告警、新闻通讯、审计日志
:::

| 阶段 | 领域 | 表数量 | 关键决策 |
|-------|--------|--------|-------------|
| 1 | 认证与用户 | 12 | Supabase Auth + 自定义用户资料 |
| 2 | 订阅 | 8 | Stripe webhook驱动的状态机 |
| 3 | 交易 | 35 | 工具、持仓、信号、自选列表 |
| 4 | 社区 | 25 | Discord同步、审核日志、信誉系统 |
| 5 | 分析 | 30 | 指标、报告、遥测事件 |
| 6 | 研究 | 40 | 策略、指标、回测结果 |
| 7 | 运营 | 35 | 告警、新闻通讯、审计日志 |

每个阶段都有独立的迁移批次。在开发新阶段时，我从不修改前一阶段的表。这保证了部署的安全性。

## 我遵循的三条规则

### 规则1：除热路径外，全部规范化

规范化的数据始终是标准数据。
