---
title: "Supabase 本番運用：185テーブルを前に知っておきたかったこと"
excerpt: "Supabaseを本番環境で1年間、185テーブルと共に運用した正直なレビュー — 素晴らしい点、苛立つ点、そして乗り換え寸前になった理由。"
sourceSlug: supabase-in-production-what-i-wish-i-knew-before-185-tables
locale: ja
machineTranslated: true
---

# 本番環境でSupabaseを使ってみて：185テーブルになる前に知っておきたかったこと

私は1年以上にわたり、本番環境でSupabaseを運用してきました。185のテーブル、69のAPIエンドポイント、Stripeのwebhook、リアルタイムサブスクリプション、Discordボットのデータ、トレーディング分析などです。

これは「はじめよう」系のチュートリアルではありません。大規模運用を経験した上での、率直なレビューです。

## 本当に素晴らしい点

### Row-Level Securityがすべてを変える

RLSはSupabaseのキラー機能ですが、ほとんどの人はその真価を活かしきれていません。すべてのAPIエンドポイントで認可チェックを書く代わりに、データベース自体がアクセスを制御します：

\\\
