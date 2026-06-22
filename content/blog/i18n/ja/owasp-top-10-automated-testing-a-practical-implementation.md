---
title: "OWASP Top 10 自動テスト：実践的な実装"
excerpt: "CI/CDパイプラインでSQLインジェクション、XSS、認証の欠陥など、OWASPの10カテゴリを自動チェックするセキュリティスキャナを構築した方法。"
sourceSlug: owasp-top-10-automated-testing-a-practical-implementation
locale: ja
machineTranslated: true
---

# OWASP Top 10 自動テスト：実践的な実装方法

セキュリティテストは四半期ごとの監査であるべきではありません。すべてのプルリクエストで実行されるべきです。ここでは、自動化されたOWASP Top 10スキャナをどのように構築したかを説明します。

## アプローチ

各OWASPカテゴリには、固有のペイロードと検出ロジックを備えた専用のテストモジュールが割り当てられます。
