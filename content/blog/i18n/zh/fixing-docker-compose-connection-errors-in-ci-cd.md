---
title: "修复CI/CD中的Docker Compose连接错误"
excerpt: "花了4小时调试Jenkins中的'连接被拒绝'错误。以下是我在CI管道中学到的Docker网络知识。"
sourceSlug: fixing-docker-compose-connection-errors-in-ci-cd
locale: zh
sourceHash: 8e0431f892a3afac
machineTranslated: true
---

# 修复 CI/CD 中的 Docker Compose 连接错误

想象一下：你的 Docker Compose 配置在本地机器上完美运行。当你推送到 CI 时，突然所有集成测试都因 `Connection refused` 而失败。

数据库容器显示"正在运行"。API 容器显示"健康"。测试进程启动了。然后它无法连接到所需的服务。

这种失败看似随机，直到你想起一件事：本地 Docker 网络和 CI Docker 网络并非同一环境。

:::proof-note title="实际教训" label="ci 笔记"
CI 中大多数 Docker Compose 连接错误并非 Docker 本身的问题。它们是时序、主机名、端口或网络边界问题，只是本地开发环境掩盖了这些差异。
:::

## 本地配置会误导你

在你的机器上，你可能会通过 `localhost:5432` 连接到 Postgres。

在 Compose 网络内部，另一个容器通常应连接到 `postgres:5432`，其中 `postgres` 是服务名称。

在 CI 中，测试运行器可能位于：

- Compose 网络内部
- Compose 网络外部的主机上
- CI 服务容器内部
- 嵌套的 Docker 执行器内部

这四种情况使用不同的主机名。

这就是为什么连接字符串在本地"正确"，但在流水线中却出错的原因。

## 首先，确定测试进程的运行位置

在修改端口之前，先问一个问题：

> 测试命令是在 Compose 服务内部运行，还是在 CI 主机上运行？

如果测试在 Compose 内部运行：

```txt
DATABASE_URL=postgres://user:pass@postgres:5432/app
```

如果测试在 CI 主机上运行且 Compose 已发布端口：

```txt
DATABASE_URL=postgres://user:pass@127.0.0.1:5432/app
```

如果测试在独立的 CI 容器中运行，则上述两种方式可能都不奏效，直到配置好 CI 平台的服务网络。

:::system-diagram title="CI 网络决策" label="compose -> tests" nodes="Compose 服务,网络,测试运行器,数据库"
正确的主机名取决于测试运行器的位置。服务名称在 Compose 网络内部有效。已发布的 localhost 端口从主机访问有效。
:::

## 不要依赖 `depends_on` 来判断就绪状态

`depends_on` 可以控制启动顺序。但它不能保证 Postgres、Redis 或你的应用已准备好接受连接。

常见的错误写法：

```yaml
services:
  api:
    depends_on:
      - postgres
```

这仅意味着 `postgres` 容器在 `api` 之前启动。它不表示迁移已运行，不表示 TCP 已就绪，也不表示数据库已接受身份验证。

请使用健康检查或显式的等待脚本。

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

这仍然不能解决所有 CI 平台的问题，但它消除了最常见的竞态条件。

## 检查四类失败原因

当我看到 `Connection refused` 时，我会按以下顺序排查。

:::checklist title="Docker Compose CI 检查清单" label="调试顺序"
- 确认测试运行器位置：主机、Compose 服务或 CI 服务容器
- 确认主机名：服务名称 vs 127.0.0.1 vs 平台服务别名
- 确认已发布的端口确实已映射
- 确认依赖项在测试开始前已处于健康状态
- 在 CI 中打印已解析的环境变量（不泄露密钥）
- 在运行完整测试套件之前，先执行一个简单的 TCP 检查
:::

TCP 检查虽然简单但很有用：

```bash
node -e "require('net').connect(5432, process.env.DB_HOST).on('connect', () => { console.log('ok'); process.exit(0) }).on('error', e => { console.error(e.message); process.exit(1) })"
```

如果这个检查失败，那么你的应用测试套件还不是需要调试的对象。

## 为不同边界使用不同的连接字符串

一种清晰的模式是明确边界：

```env
DATABASE_URL_INTERNAL=postgres://app:app@postgres:5432/app
DATABASE_URL_HOST=postgres://app:app@127.0.0.1:5432/app
```

然后你的 CI 任务根据命令运行的位置选择正确的连接字符串。

这比试图让一个 URL 在所有地方都生效要更可靠。

:::scorecard title="连接字符串合理性检查" label="评分卡"
运行器位置 | 主机名 | 端口来源
Compose 内部 | postgres | 容器端口
CI 主机 | 127.0.0.1 | 已发布端口
CI 服务容器 | 服务别名 | 平台服务配置
远程数据库 | 公共/私有数据库主机 | 网络白名单
:::

## 将迁移与就绪状态分开

数据库可能在模式就绪之前就已经处于健康状态。

如果你的应用需要迁移，请将其设为显式的流水线步骤：

```bash
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm test
```

或者，在等待以下条件都满足的服务中运行测试：

- 数据库健康
- 迁移完成
- 种子数据加载完毕

否则，你会遇到更糟糕的失败类型：间歇性的测试错误看起来像是应用 bug，但实际上是由配置竞态条件引起的。

## 我希望在每个 CI 失败中看到的调试输出

不要转储密钥。但要打印环境的结构。

有用的输出：

- Docker Compose 服务及其状态
- 依赖项的容器日志
- 已解析的主机和端口（密码需脱敏）
- 网络名称
- 健康检查状态
- 迁移状态

示例：

```bash
docker compose ps
docker compose logs --tail=80 postgres
docker network ls
```

目标是让下一次失败能够一次排查就诊断出来。

## 生产环境的启示

CI 网络问题是对生产环境集成问题的预演。

如果你的测试依赖运气，那么你的部署可能也是如此。明确服务边界。添加健康检查。将就绪状态与迁移分开。记录正确的事实。

这样才能将"在我机器上能运行"变成流水线可以验证的东西。

:::offer-cta title="需要清理流水线？" label="下一步" href="/tools/route-finder" cta="找到你的路线"
使用诊断工具来决定这是否是一个聚焦的审计冲刺、一个平台构建，还是一个你可以自行完成的培训路径。
:::
