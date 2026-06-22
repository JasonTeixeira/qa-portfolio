---
title: "投资组合风险数学解析：VaR、CVaR 及协方差估计的重要性"
excerpt: "RiskRadar 背后的数学原理——面向非量化工程师解释风险价值、条件风险价值、Ledoit-Wolf 收缩及蒙特卡洛模拟。"
sourceSlug: portfolio-risk-math-explained-var-cvar-and-why-covariance-estimation-matters
locale: zh
machineTranslated: true
---

# 投资组合风险数学解析：VaR、CVaR 以及为何协方差估计如此重要

在构建 RiskRadar 时，我需要实现机构级别的风险计算。大多数风险管理教程要么过于简化（"只需计算标准差"），要么假设读者具备博士级别的数学水平。

这里提供一个折中方案——工程师实际需要的投资组合风险数学，以通俗易懂的方式解释。

## 风险价值（VaR）：最坏情况会怎样？

VaR 回答的问题是："在 95% 的置信水平下，一天内最大可能损失是多少？"

如果你的投资组合的 1 天 95% VaR 是 10,000 美元，这意味着：在 95% 的日子里，你的损失不会超过 10,000 美元。而在其余 5% 的日子里……情况就不好说了。

**计算 VaR 的三种方法：**

### 历史模拟法（最简单）
将历史日收益率排序。第 5 个百分位数就是你的 95% VaR。
