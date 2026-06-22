---
title: "Docker在CI/CD中的应用：将流水线时间缩短82%的模式"
excerpt: "层缓存、多阶段构建、BuildKit以及Docker模式，将我的CI流水线从45分钟缩短至8分钟。"
sourceSlug: docker-in-ci-cd-the-patterns-that-cut-my-pipeline-time-by-82
locale: zh
sourceHash: cc6640e470b056da
machineTranslated: true
---

# CI/CD 中的 Docker：让流水线时间缩短 82% 的实践模式

我的 CI 流水线过去需要 45 分钟，现在只需 8 分钟。最大的优化来自 Docker 本身——而不是更快的硬件。

## 问题所在

每次 CI 运行都要经历：
1. 拉取基础镜像（2 分钟）
2. 安装操作系统依赖（5 分钟）
3. 安装 Python 包（8 分钟）
4. 安装 Node 包（6 分钟）
5. 构建应用（4 分钟）
6. 运行测试（15 分钟）
7. 构建生产镜像（5 分钟）

总计：约 45 分钟。开发者不再运行完整的流水线，导致 Bug 被遗漏。

## 优化方案 1：多阶段构建（45 → 30 分钟）
