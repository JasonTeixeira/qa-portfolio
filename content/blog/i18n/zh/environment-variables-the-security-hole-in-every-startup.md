---
title: "环境变量：每个初创公司的安全漏洞"
excerpt: "你的 .env 文件里有数据库密码、Stripe 密钥和 AWS 凭证。它出现在 Slack 消息里、开发者的笔记本上，可能还在某个 Docker 镜像里。让我们解决这个问题。"
sourceSlug: environment-variables-the-security-hole-in-every-startup
locale: zh
machineTranslated: true
---

# 环境变量：每家初创公司的安全漏洞

快速自查：你的数据库密码现在在哪里？

如果你的答案是"仓库根目录下的 .env 文件"——那你和大多数人一样。如果你的答案是"还发给了新员工的 Slack 消息里、Confluence 的截图中、以及 Dave 离职前写的那几个 Lambda 函数里硬编码着"——那你很诚实。

环境变量是大多数初创公司中最危险的基础设施，因为每个人都把它们当作事后才考虑的事情。

## 常见错误

### 错误 1：将 .env 文件纳入版本控制

我在真实公司的生产仓库中见过这种情况。一个 \
