---
title: "どんなコースよりも学びを与えてくれたバグ"
excerpt: "決済ウェブフックハンドラの競合状態が3週間も気づかれず、発動時に4人の顧客に二重請求が発生。完全なポストモーテムと、今では請求コードを異なる方法でテストする理由。"
sourceSlug: the-bug-that-taught-me-more-than-any-course-ever-did
locale: ja
sourceHash: c708a0d3fda65b18
machineTranslated: true
---

# あのバグは、どんなコースよりも多くのことを教えてくれた

あるバグについて話したいと思います。楽しいバグでも、巧妙なバグでもありません。木曜日の午後11時にSlack通知が届いたとき、胃の底が落ちるような、そんなバグです。

## 何が起きたのか

私はNexuralのサブスクリプション課金システムを構築していました。Stripeのwebhookが届いた——
