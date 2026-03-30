# OpenClaw Release V1 Code Review

**Date:** 2026-03-29

**Scope:** `apps/web`, `apps/api`, `apps/seller-sim`, `scripts/start-release.ts`, release scripts, release docs, and release browser flow

## Findings

本轮人工 review 没有发现阻塞发布的功能性缺陷。

独立 reviewer 在中途提出过 2 个 `P2` 问题，现已修复：

- `test:e2e:release` 改为使用隔离端口，不再和默认 `start:release` 端口重叠
- 反馈与候补表单现在能区分“输入无效”和“服务端故障”

## What Was Checked

- 发布版默认路径是否是家庭补货
- `Demo` 和 `Live` 两条链路是否都能跑通
- 反馈和候补邮箱是否真实落盘
- 启动脚本是否支持开箱运行和端口冲突规避
- README、架构文档、脚本和测试是否描述同一个产品

## Residual Risks

- 本地 intake 目前是 JSONL 文件，没有鉴权、去重和反滥用能力
- 仓库里仍然保留 legacy extension 和旧测试资产，未来继续扩展时要防止它们重新侵入发布门槛
- 提权运行时会出现 `NO_COLOR` / `FORCE_COLOR` 的 Node warning，不影响功能，但后续可以在脚本层压掉

## Verification Evidence

- `pnpm verify:release`
  - 28 个测试文件
  - 45 个测试
  - 全部通过
- `pnpm build:web`
  - 通过
- `pnpm test:e2e:release`
  - 2 个 Playwright 用例
  - 全部通过
- `pnpm start:release`
  - 启动成功
  - `http://127.0.0.1:4174` 返回 `200 OK`
  - `http://127.0.0.1:4300/health` 返回 `{"status":"ok","service":"buyer-api"}`
  - `http://127.0.0.1:4301/health` 返回 `{"status":"ok","service":"seller-sim"}`
