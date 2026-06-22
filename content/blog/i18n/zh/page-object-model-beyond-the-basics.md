---
title: "页面对象模型：超越基础"
excerpt: "大多数团队错误地实现了POM。以下是如何构建一个真正可维护、可扩展至数百个测试的Selenium框架。"
sourceSlug: page-object-model-beyond-the-basics
locale: zh
machineTranslated: true
---

# Page Object Model：超越基础

我见过的大多数 Selenium 框架都使用了 Page Object Model，但它们的实现方式并不正确。在构建企业级框架并维护 300 多个跨复杂电商流程的测试后，以下才是真正有效的做法。

## 标准 POM 的问题

每个人都是从教科书式的 POM 示例开始的：
