---
title: "不会让你想辞职的Git工作流"
excerpt: "主干开发 vs GitFlow vs GitHub Flow — 这三种我都用过。以下是对独立开发者和小团队真正有效的方法，以及为什么大多数Git工作流过于复杂。"
sourceSlug: git-workflows-that-don
locale: zh
sourceHash: c676d6ff79c74263
machineTranslated: true
---

# 不会让你想辞职的 Git 工作流

我在大型项目上用过 GitFlow。特性分支、开发分支、发布分支、热修复分支。分支图看起来像地铁线路图。合并一个特性需要冲突解决方面的博士学位。

现在我采用主干开发。一个分支。从 main 发布。我的部署频率从每周一次变成了每天一次。

## 为什么大多数 Git 工作流过于复杂

GitFlow 是为每季度通过物理介质发布软件而设计的。如果你的部署过程涉及刻录 CD，那你需要发布分支。

如果你通过合并到 main 来部署，剩下的交给 Vercel/GitHub Actions 处理，那你根本不需要 GitFlow 的 90%。

## 我实际在做什么

\\\
