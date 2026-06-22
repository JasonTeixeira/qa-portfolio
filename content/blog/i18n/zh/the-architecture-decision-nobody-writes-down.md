---
title: "没人写下的架构决策"
excerpt: "我们花数周在Kafka和RabbitMQ之间做选择，却从不记录原因。ADR只需15分钟，却能省下数月‘我们为什么这么做？’的讨论。"
sourceSlug: the-architecture-decision-nobody-writes-down
locale: zh
machineTranslated: true
---

# 没人写下来的架构决策

六个月前，我为 Nexural 选择了 Supabase 而非 Firebase。我有充分的理由——PostgreSQL、行级安全、可自托管。但我差点忘了这些理由。唯一让我免于重新评估同一决策（并浪费一周时间）的，是一份我花了15分钟写的 markdown 文件。

## 问题

每个工程团队都有过这样的对话：

"为什么我们用 RabbitMQ 而不是 Kafka？"
"我记得是 Dave 选的。Dave 8个月前离职了。"
"..."
"我们要不要换成 Kafka？"

于是你花了一个迭代去重新评估一个已经被评估过的决策。机构知识就这样走出了大门。

## 架构决策记录（ADR）

ADR 是一份简短文档，记录一个重大决策。我的做法极其简单：
