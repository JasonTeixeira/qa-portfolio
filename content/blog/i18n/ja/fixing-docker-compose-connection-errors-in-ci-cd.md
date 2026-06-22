---
title: "CI/CDにおけるDocker Compose接続エラーの修正"
excerpt: "Jenkinsで「接続が拒否されました」エラーのデバッグに4時間費やしました。CIパイプラインにおけるDockerネットワーキングについて学んだことを紹介します。"
sourceSlug: fixing-docker-compose-connection-errors-in-ci-cd
locale: ja
sourceHash: 8e0431f892a3afac
machineTranslated: true
---

# CI/CDにおけるDocker Composeの接続エラーを修正する

こんな状況を想像してみてください。ローカルマシンではDocker Composeの設定が完璧に動作している。ところがCIにプッシュした途端、すべての統合テストが`Connection refused`で失敗する。

データベースコンテナは「実行中」、APIコンテナは「正常」、テストプロセスが起動する。そして必要なサービスに接続できない。

この失敗はランダムに見えますが、一つだけ覚えておくべきことがあります。ローカルのDockerネットワークとCIのDockerネットワークは同じ環境ではないのです。

:::proof-note title="実際の教訓" label="ci note"
CIにおけるDocker Composeの接続エラーのほとんどは、Docker自体の問題ではありません。タイミング、ホスト名、ポート、またはネットワーク境界の問題であり、ローカル開発では隠れて見えないものです。
:::

## ローカル環境はあなたを欺く

自分のマシンでは、`localhost:5432`でPostgresに接続するかもしれません。

Composeネットワーク内では、別のコンテナは通常`postgres:5432`に接続すべきです。ここで`postgres`はサービス名です。

CIでは、テストランナーは以下のいずれかの場所に存在します：

- Composeネットワークの内部
- Composeネットワークの外部（ホスト上）
- CIサービスのコンテナ内部
- ネストされたDocker executorの内部

これら4つのケースでは、異なるホスト名を使用します。

そのため、接続文字列がローカルでは「正しく」、パイプラインでは間違っているということが起こるのです。

## まず、テストプロセスがどこで実行されているかを特定する

ポートを変更する前に、一つの質問をしてください：

> テストコマンドはComposeサービス内で実行されていますか、それともCIホスト上で実行されていますか？

テストがCompose内で実行される場合：

```txt
DATABASE_URL=postgres://user:pass@postgres:5432/app
```

テストがCIホスト上で実行され、Composeがポートを公開している場合：

```txt
DATABASE_URL=postgres://user:pass@127.0.0.1:5432/app
```

テストが別のCIコンテナで実行される場合、CIプラットフォームのサービスネットワーキングが設定されるまでは、どちらも機能しない可能性があります。

:::system-diagram title="CIネットワーキングの判断" label="compose -> tests" nodes="Compose service,Network,Test runner,Database"
適切なホスト名は、テストランナーがどこに存在するかに依存します。サービス名はComposeネットワーク内で機能します。公開されたlocalhostポートはホストから機能します。
:::

## `depends_on`を準備完了として信用しない

`depends_on`は起動順序を制御できます。しかし、Postgres、Redis、またはアプリケーションが接続を受け入れる準備ができていることを保証するものではありません。

よくある悪い例：

```yaml
services:
  api:
    depends_on:
      - postgres
```

これは単に`postgres`コンテナが`api`より先に起動することを意味するだけです。マイグレーションが実行されたことを意味しません。TCPの準備ができていることを意味しません。データベースが認証を受け入れたことを意味しません。

ヘルスチェックか明示的な待機スクリプトを使用してください。

```yaml
services:
  postgres:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 12

  api:
    depends_on:
      postgres:
        condition: service_healthy
```

これでもすべてのCIプラットフォームで解決するわけではありませんが、最も一般的な競合状態は除去できます。

## 4つの障害クラスを確認する

`Connection refused`を見たときは、この順序で確認します。

:::checklist title="Docker Compose CI チェックリスト" label="debug order"
- テストランナーの場所を確認：ホスト、Composeサービス、またはCIサービスコンテナ
- ホスト名を確認：サービス名 vs 127.0.0.1 vs プラットフォームのサービスエイリアス
- 公開ポートが実際にマッピングされていることを確認
- テスト開始前に依存関係が正常であることを確認
- シークレットを漏洩させずに、CIで解決された環境変数を出力
- 完全なテストスイートの前に、小さなTCPチェックを実行
:::

TCPチェックは地味ですが有用です：

```bash
node -e "require('net').connect(5432, process.env.DB_HOST).on('connect', () => { console.log('ok'); process.exit(0) }).on('error', e => { console.error(e.message); process.exit(1) })"
```

これが失敗する場合、アプリケーションのテストスイートをデバッグする段階ではありません。

## 異なる境界に異なる接続文字列を使用する

一つのクリーンなパターンは、境界を明示的にすることです：

```env
DATABASE_URL_INTERNAL=postgres://app:app@postgres:5432/app
DATABASE_URL_HOST=postgres://app:app@127.0.0.1:5432/app
```

そして、CIジョブはコマンドが実行される場所に基づいて適切な方を選択します。

これは、一つのURLをどこでも機能させようとするよりも、はるかに魔法の少ない方法です。

:::scorecard title="接続文字列の健全性チェック" label="scorecard"
ランナーの場所 | ホスト名 | ポートのソース
Compose内部 | postgres | コンテナポート
CIホスト | 127.0.0.1 | 公開ポート
CIサービスコンテナ | サービスエイリアス | プラットフォームのサービス設定
リモートDB | パブリック/プライベートDBホスト | ネットワーク許可リスト
:::

## マイグレーションと準備完了を分離する

データベースは、スキーマの準備ができる前に正常になる可能性があります。

アプリケーションにマイグレーションが必要な場合、それを明示的なパイプラインステップにします：

```bash
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm test
```

または、以下を待機するサービス内でテストを実行します：

- データベースの正常性
- マイグレーションの完了
- シードデータのロード

そうしないと、より悪い種類の障害が発生します。アプリのバグのように見えるが、実際にはセットアップの競合状態である断続的なテストエラーです。

## すべてのCI障害で欲しいデバッグ出力

シークレットをダンプしないでください。環境の形状を出力してください。

有用な出力：

- Docker Composeのサービスとステータス
- 依存関係のコンテナログ
- パスワードを伏せ字にした、解決済みのホストとポート
- ネットワーク名
- ヘルスチェックのステータス
- マイグレーションのステータス

例：

```bash
docker compose ps
docker compose logs --tail=80 postgres
docker network ls
```

目標は、次の障害を一度のパスで診断可能にすることです。

## 本番環境からの教訓

CIネットワーキングの苦労は、本番環境での統合の苦労の予告編です。

テストが「うまくいくことを願う」に依存しているなら、デプロイメントもおそらくそうでしょう。サービス境界を明示的にし、ヘルスチェックを追加し、準備完了とマイグレーションを分離し、適切な情報をログに記録してください。

そうすることで、「私のマシンでは動く」をパイプラインが証明できるものに変えられるのです。

:::offer-cta title="パイプラインの整理が必要ですか？" label="次のステップ" href="/tools/route-finder" cta="ルートを見つける"
診断ツールを使用して、これが集中的な監査スプリントなのか、プラットフォーム構築なのか、自分で進められる学習パスなのかを判断してください。
:::
