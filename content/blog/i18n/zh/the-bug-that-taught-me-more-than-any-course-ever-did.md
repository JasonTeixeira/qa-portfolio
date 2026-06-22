---
title: "那个比任何课程都教会我更多的Bug"
excerpt: "一个支付webhook处理程序中的竞态条件潜伏了3周未被发现。当它触发时，导致4位客户被重复扣款。以下是完整的故障复盘，以及我如今为何以不同方式测试计费代码。"
sourceSlug: the-bug-that-taught-me-more-than-any-course-ever-did
locale: zh
sourceHash: c708a0d3fda65b18
machineTranslated: true
---

# 那个比任何课程都教会我更多的 Bug

我想跟你聊聊一个 Bug。不是什么有趣的 Bug，也不是什么巧妙的 Bug。而是那种周四晚上 11 点收到 Slack 通知时让你胃里一沉的那种。

## 发生了什么

当时我正在为 Nexural 构建订阅计费功能。Stripe 的 webhook 进来了——
