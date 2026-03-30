# OpenClaw Release V1 Baseline Review

**Date:** 2026-03-29

## Baseline Before Hardening

在进入本轮发布加固之前，仓库存在几个明显问题：

- 顶层 `verify` 仍然被历史 extension 和非发布面测试拖住
- Web 发布路径缺少一键启动命令
- README 和架构文档仍然把旧 extension MVP 作为主叙事
- 页面虽然能运行，但反馈和留资还没有形成完整的发布闭环
- 中文用户面对的首屏仍然有明显中英混合和 operator 文案

## Hardening Decision

本轮发布明确把 `apps/web` 作为发布表面，并将 `apps/api` 和 `apps/seller-sim` 作为本地支撑服务。发布验证以 `verify:release` 为准，不再要求整个历史仓库同时达到同一发布标准。

## Expected End State

完成后，发布版需要满足：

- `pnpm start:release` 可直接启动
- `pnpm verify:release` 通过
- 页面默认讲家庭补货故事
- 反馈和邮箱可真实写入本地文件
- README、架构文档、脚本和测试描述同一个产品
