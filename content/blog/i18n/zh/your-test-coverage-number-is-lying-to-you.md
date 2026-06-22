---
title: "你的测试覆盖率数字在欺骗你"
excerpt: "如果测试的是错误的80%，那么80%的测试覆盖率毫无意义。以下是我对覆盖率的看法——不是追逐的数字，而是盲点的地图。"
sourceSlug: your-test-coverage-number-is-lying-to-you
locale: zh
machineTranslated: true
---

# 你的测试覆盖率数字在欺骗你

我见过测试覆盖率达95%的代码库每周都会发布严重bug。也见过覆盖率仅40%的代码库却极少出问题。

问题不在于数字本身，而在于对数字的执念。

## 覆盖率陷阱

下面这个测试能提高覆盖率，但抓不住任何问题：
