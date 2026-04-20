# Claw Native KShop 智能卖家系统 架构说明

> 自动生成于 2026-03-23，基于代码静态分析

## 定位
基于 Claw（AI Agent）的快手电商原生智能卖家系统。

## 技术栈
- TypeScript
- Fastify
- Zod
- pnpm workspace
- Vitest

## 模块结构

| 模块 | 说明 |
|------|------|
| apps/api | API 服务 |
| apps/seller-sim | 卖家模拟器 |
| packages/catalog | 商品目录 |
| packages/checkout | 结算 |
| packages/fulfillment | 履约 |
| packages/offer-evaluator | 报价评估 |
| packages/demand-planner | 需求规划 |
| packages/policy-engine | 策略引擎 |
| packages/orchestrator | 编排器 |
| packages/memory | 记忆模块 |
| packages/seller-protocol | 卖家协议 |
| packages/contracts | 契约 |
| packages/shared | 共享模块 |

## 核心能力
1. AI 驱动电商卖家全链路
2. 智能选品
3. 智能定价
4. 库存管理
5. 履约管理
6. 策略引擎

## 关键设计
- **Monorepo 架构**：pnpm workspace 管理多包
- **AI Agent 驱动**：基于 Claw Agent 的智能决策
- **领域包拆分**：每个业务能力独立包，松耦合

## 依赖服务
- Claw AI Agent 平台
- 快手电商 API

## 代码规模
- Commits: 34（早期项目）
- 贡献者: -
- 文件数: -
