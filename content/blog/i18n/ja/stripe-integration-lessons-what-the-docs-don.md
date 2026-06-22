---
title: "Stripe統合の教訓：ドキュメントに書かれていないこと"
excerpt: "Webhookの冪等性、サブスクリプションのステートマシン、ダニング戦略、そしてそれらを処理しないと課金システムが壊れるエッジケース。"
sourceSlug: stripe-integration-lessons-what-the-docs-don
locale: ja
machineTranslated: true
---

# Stripe連携の教訓：ドキュメントには書かれていないこと

Stripeのドキュメントは、ハッピーパスに関しては非常に優れています。しかし、本番環境での請求処理には、準備ができていなければシステムを壊しかねないエッジケースが存在します。

以下は、NexuralトレーディングプラットフォームにStripeを統合する過程で学んだことです。

## Webhookステートマシン

Stripeはあらゆるイベントに対してWebhookを送信します。あなたの役割は、それらを冪等に処理することです。なぜなら、Stripeは失敗したWebhookを再試行し、重複が発生するからです。
