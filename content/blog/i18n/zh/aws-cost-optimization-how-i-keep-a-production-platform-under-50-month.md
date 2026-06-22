---
title: "AWS 成本优化：如何将生产平台月费控制在 50 美元以下"
excerpt: "Nexural 平台运行在 AWS 上，结合 Vercel、Supabase 和特定 AWS 服务。以下是我如何将拥有 185 张表和实时数据的平台成本控制在每月 50 美元以下。"
sourceSlug: aws-cost-optimization-how-i-keep-a-production-platform-under-50-month
locale: zh
machineTranslated: true
---

# AWS 成本优化：如何将生产平台月费控制在 50 美元以下

Nexural 生态系统拥有 185 张数据库表、69 个 API 端点、实时市场数据、AI 驱动功能以及一个实时质量仪表盘。我的 AWS 账单每月不到 50 美元。

以下是具体方法。

## 省钱的架构设计

**原则：使用托管服务的免费/低价层级，而非自行搭建基础设施。**

| 服务 | 功能 | 月费 |
|---------|-------------|-------------|
| Vercel（Hobby → Pro） | Next.js 托管、边缘函数 | $0-20 |
| Supabase（Free → Pro） | PostgreSQL、认证、实时功能 | $0-25 |
| AWS S3 | 遥测数据、构建产物 | $0.02 |
| AWS Lambda | API 代理、遥测数据采集 | $0（免费层级） |
| AWS API Gateway | Lambda HTTP 端点 | $0（免费层级） |
| AWS CloudFront | CDN + WAF | $0（免费层级） |
| GitHub Actions | CI/CD、定时任务 | $0（公开仓库免费） |

**总计：生产平台每月约 $25-45。**

## 省钱技巧

### 1. 用 Supabase 替代 RDS

Supabase Pro 实例每月 $25，包含：
- PostgreSQL 15，8GB 存储
- 行级安全
- 实时订阅
- 内置认证
- 自动备份

等效的 RDS 实例（db.t3.micro）每月 $15，但需要自行管理备份、认证和实时功能。加上这些服务后，费用将超过 $60。

### 2. 用 Lambda 处理突发工作负载

遥测数据采集 API 大部分时间处理零请求，仅在 CI 运行时出现突发流量。Lambda 是完美选择：空闲时零费用，突发时仅需几美分。
