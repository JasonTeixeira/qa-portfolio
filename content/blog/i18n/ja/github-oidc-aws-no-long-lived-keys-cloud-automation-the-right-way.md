---
title: "GitHub OIDC → AWS（長期キー不要）：クラウド自動化の正しい方法"
excerpt: "GitHub Actions OIDCを使用してAWS IAMロールを引き受け、AWSキーを保存せずにアーティファクトをデプロイ/アップロードする方法。最小権限IAM、信頼ポリシーパターン、トラブルシューティングのヒントを含む。"
sourceSlug: github-oidc-aws-no-long-lived-keys-cloud-automation-the-right-way
locale: ja
machineTranslated: true
---

# GitHub OIDC → AWS（長期間有効なキー不要）：クラウド自動化の正しい方法

CIに静的なAWSキーを埋め込むのは危険です。

スケーラブルで（かつセキュリティレビューに合格する）クラウド自動化を実現するには、**OIDCベースのフェデレーション**を使用しましょう：

- GitHub Actionsが短期間有効なIDトークン（OIDC）を発行
- AWS STSがそれを短期間有効なAWS認証情報と交換
- ワークフローが最小権限のロールを引き受けて処理を実行

このポートフォリオでも同じパターンを使用し、長期間有効な認証情報を埋め込むことなく**クラウドテレメトリモード**（AWS S3）をサポートしています。

## アーキテクチャ

\
