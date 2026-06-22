---
title: "Page Object Model: 基本を超えて"
excerpt: "ほとんどのチームがPOMを誤って実装しています。何百ものテストにスケールする真に保守可能なSeleniumフレームワークの構築方法をご紹介します。"
sourceSlug: page-object-model-beyond-the-basics
locale: ja
sourceHash: cd6d6bcc7bc6b9c6
machineTranslated: true
---

# Page Object Model: 基本を超えて

私が見てきたSeleniumフレームワークのほとんどはPage Object Modelを使用していますが、その実装方法は間違っています。エンタープライズ規模のフレームワークを構築し、複雑なeコマースフロー全体で300以上のテストを保守してきた経験から、実際に機能する方法をお伝えします。

## 標準的なPOMの問題点

誰もが教科書的なPOMの例から始めます：

\
