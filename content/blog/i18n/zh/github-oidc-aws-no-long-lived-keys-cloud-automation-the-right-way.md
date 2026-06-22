---
title: "GitHub OIDC → AWS（无需长期密钥）：正确的云自动化方式"
excerpt: "如何使用 GitHub Actions OIDC 承担 AWS IAM 角色并部署/上传工件，无需存储 AWS 密钥。包含最小权限 IAM、信任策略模式和故障排除技巧。"
sourceSlug: github-oidc-aws-no-long-lived-keys-cloud-automation-the-right-way
locale: zh
sourceHash: bfc0536b90edf6b9
machineTranslated: true
---

# GitHub OIDC → AWS（无需长期密钥）：云自动化的正确方式

在 CI 中硬编码静态 AWS 密钥无异于埋雷。

如果你想要可扩展（且能通过安全审查）的云自动化方案，请使用 **基于 OIDC 的联合身份认证**：

- GitHub Actions 签发短期身份令牌（OIDC）
- AWS STS 将其兑换为短期 AWS 凭证
- 你的工作流承担最小权限角色并执行任务

本作品集采用相同模式支持 **云遥测模式**（AWS S3），全程无需嵌入长期凭证。

## 架构

\
