---
title: "Terraform モジュールパターン：再利用可能なIaCの構成方法"
excerpt: "意見を取り入れたTerraformモジュールパターン — 一貫した変数命名、出力契約、Terratestによるテスト、チーム間で機能するモジュール構造。"
sourceSlug: terraform-module-patterns-how-i-structure-iac-for-reuse
locale: ja
sourceHash: 1fc529dc16591e27
machineTranslated: true
---

# Terraform モジュールパターン：再利用可能なIaCの構成方法

AWS Landing Zone や複数のインフラストラクチャプロジェクトを構築してきた経験から、他の人が実際に使える Terraform モジュールの書き方について、私なりの考えが固まってきました。

## モジュール構成

すべてのモジュールは以下の構成に従います：
