# Claw Native 系统拆解版说明

**适用对象：** 创始团队、产品、工程、架构讨论  
**版本基线：** `codex/openclaw-web-validation`，提交 `d9bde3c`

## 1. 目标

这份文档不是讲愿景，而是把当前系统按工程视角拆开，回答：

- 系统有哪些子系统
- 每个子系统负责什么
- 数据和控制流怎么走
- 当前边界在哪里
- 后续应该往哪里扩

## 2. 系统总览

当前系统可拆成 5 个层级：

1. `User Interaction Layer`
2. `Validation / Demo Layer`
3. `Buyer API Layer`
4. `Procurement Orchestration Layer`
5. `Seller Protocol Layer`

附带两个横向能力：

- `Memory / Audit Layer`
- `Architecture Guardrails / Test Layer`

## 3. 子系统拆解

## 3.1 Browser Extension

### 作用

作为用户侧购物副驾入口，嵌入 JD 页面。

### 主要职责

- 解析商品页和购物车页 DOM
- 显示一句话决策和一个可执行动作
- 记录用户偏好与行为

### 关键文件

- [product-page.content.tsx](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/browser-extension/entrypoints/product-page.content.tsx)
- [cart.content.tsx](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/browser-extension/entrypoints/cart.content.tsx)
- [buildProductDecision.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/browser-extension/src/recommendation/buildProductDecision.ts)
- [buildCartPlan.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/browser-extension/src/recommendation/buildCartPlan.ts)
- [preferences.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/browser-extension/src/storage/preferences.ts)
- [events.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/browser-extension/src/storage/events.ts)

### 当前边界

- 只做页面内决策辅助
- 不直接调用 buyer API
- 本地保存偏好和验证事件
- 规则引擎是确定性的，不依赖远程模型

## 3.2 Web Validation Console

### 作用

作为系统展示和验证入口，给投资人、合作方和内部团队演示真实交易链路。

### 运行模式

- `Demo`
  - 稳定预设数据
  - 不依赖本地后端
- `Live`
  - 通过 buyer API 和 seller-sim 展示真实补货链路

### 关键文件

- [liveRuntime.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/web/src/runtime/liveRuntime.ts)
- [types.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/web/src/runtime/types.ts)

### 当前边界

- 是验证层，不是正式运营后台
- `Live` 已经是真实 buyer API 链路
- 但 seller network 仍是本地 seller-sim

## 3.3 Buyer API

### 作用

作为买方代理系统的统一 HTTP 入口。

### 主要职责

- 暴露 health 接口
- 接收 replenishment request
- 根据 scenario 和 mode 生成 live procurement profile
- 组装 seller port 和 quote collector
- 调 orchestrator
- 返回 explanation 和 snapshot

### 关键文件

- [server.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/api/src/server.ts)
- [intents.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/api/src/routes/intents.ts)
- [orders.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/api/src/routes/orders.ts)

### 对外接口

- `GET /health`
- `POST /intents/replenish`
- `GET /orders/:id`
- `GET /orders/:id/explanation`

### 当前边界

- API 自己不承载核心采购逻辑
- 采购逻辑必须下沉到 orchestrator

## 3.4 Live Profiles

### 作用

把前端 `scenarioId + mode` 映射成后端可执行的采购配置。

### 关键文件

- [liveProfiles.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/orchestrator/src/liveProfiles.ts)
- [live-replenishment.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/contracts/src/live-replenishment.ts)

### 产出内容

- planning input
- policy auto approve limit
- request metadata

### 当前价值

这层把“页面演示选项”变成“真实后端请求配置”，避免 scenario 和 mode 只停留在 UI 文案层。

## 3.5 Procurement Orchestrator

### 作用

这是整个系统的交易编排核心，也是系统里最重要的模块。

### 关键文件

- [service.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/orchestrator/src/service.ts)
- [machine.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/orchestrator/src/machine.ts)

### 核心职责

1. 从 demand planner 获取 intent
2. 生成 RFQ
3. 调 quote collector 获取多个 seller quote
4. 选择最优 quote
5. 执行 policy evaluation
6. 根据结果走：
   - approved
   - approval required
   - rejected / retry
7. hold inventory
8. 执行 checkout
9. 写 audit events 与 snapshot

### 当前状态机

- `sourcing`
- `quoteCollection`
- `offerSelected`
- `inventoryHeld`
- `paymentAuthorized`
- `orderCommitted`
- `fulfillmentStarted`
- `approvalWait`
- `exception`
- `retry`

### 设计意义

这层保证所有交易状态变化都集中发生，不允许各模块随意改 order state。

## 3.6 Demand Planner

### 作用

基于库存阈值生成补货意图。

### 关键文件

- [plan.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/demand-planner/src/plan.ts)

### 当前逻辑

- 当 `quantityOnHand < reorderPoint` 时生成 demand intent
- intent 包含：
  - category
  - quantity
  - delivery window
  - budget limit

### 当前边界

- 还没有接真实消费历史和长期记忆
- 当前主要是 scenario-driven input

## 3.7 Offer Evaluator

### 作用

对多个 seller offer 做排序，选出当前最合适的 seller。

### 关键文件

- [score.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/offer-evaluator/src/score.ts)

### 当前评分维度

- `policyMatch`
- `trust`
- `etaHours`
- `totalCost`

### 当前意义

这说明系统已经不再是“拿到第一个 quote 就走”，而是进入了真实的 seller selection。

## 3.8 Policy Engine

### 作用

决定订单是否自动通过、进入审批，或直接拒绝。

### 关键文件

- [evaluate.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/policy-engine/src/evaluate.ts)

### 当前输入

- auto approve limit
- blocked sellers
- required certifications
- substitution rules

### 当前输出

- `approved`
- `approval_required`
- `rejected`

### 当前意义

这是“人设边界”进入系统的第一步。  
也就是说，用户或组织的风险边界不是靠 prompt 控制，而是靠 policy 约束执行。

## 3.9 Checkout Executor

### 作用

控制交易执行顺序，并在失败时触发补偿。

### 关键文件

- [execute.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/checkout/src/execute.ts)

### 当前顺序

1. 必须先确认 inventory hold
2. 再 payment authorize
3. 再 commit order
4. 出错时 release hold / void auth / compensate

### 当前意义

这里虽然还不是接真实支付，但已经把交易执行语义封装出来了。

## 3.10 Seller Protocol Layer

### 作用

把 buyer 侧的采购编排和 seller 侧的报价 / 锁库 / 提交订单接口解耦。

### 关键文件

- 协议消息：[messages.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/seller-protocol/src/messages.ts)
- HTTP 端口：[httpPort.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/seller-protocol/src/httpPort.ts)
- Quote collector：[httpQuoteCollector.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/seller-protocol/src/httpQuoteCollector.ts)

### 当前协议动作

- RFQ
- Quote
- Inventory Hold
- Order Commit

### 当前意义

这是 Native Commerce 与“页面自动化电商”的核心区别之一：  
系统不是通过 DOM 操作卖家，而是通过结构化协议与卖家交互。

## 3.11 Seller Sim

### 作用

作为 seller network 的本地模拟实现，用于开发、验证和演示。

### 关键文件

- [handlers.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/seller-sim/src/handlers.ts)
- [data.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/seller-sim/src/data.ts)

### 当前能力

- health probe
- 单 quote
- 多 quote collection
- hold
- commit

### 当前边界

- seller 是模拟的
- marketplace 发现能力是预置的
- 还没有真实 seller onboarding / registry

## 3.12 Memory / Audit Layer

### 作用

保存 explanation 所需的所有 audit events 和当前 order snapshot。

### 关键文件

- [store.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/packages/memory/src/store.ts)

### 当前数据

- audit event stream
- order snapshot

### 当前边界

- 仍然是 in-memory
- 适合测试和 demo
- 不适合生产级交易持久化

## 3.13 Guardrails / Test Layer

### 作用

把架构边界变成自动测试，而不是靠口头约定。

### 关键文件

- [guardrails.test.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/tests/architecture/guardrails.test.ts)
- [architecture-guards.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/tests/helpers/architecture-guards.ts)

### 当前 guardrail

- LLM-facing 模块不能直接使用 payment ports
- 只有 orchestrator 能推进 order state
- committed order 必须产生日志

### 当前意义

这保证系统不会在迭代中悄悄退化成“把逻辑塞回 route 或页面”。

## 4. 关键运行时链路

## 4.1 C 端购物副驾链路

```text
JD 页面
-> content script 注入
-> 页面 parser 输出商品/购物车模型
-> recommendation engine 输出建议
-> React panel 渲染建议
-> preference / event 写入本地 storage
```

适合解决：

- 当前页买哪一个
- 当前车怎么凑单
- 用户偏好如何影响建议

## 4.2 Native Commerce Live 链路

```text
Web Console
-> scenarioId + mode
-> buyer API
-> buildLiveProcurementProfile
-> demand planner
-> RFQ
-> seller-sim /rfq/options
-> offer evaluator
-> policy engine
-> hold
-> checkout
-> commit
-> memory store
-> explanation endpoint
-> Web Console timeline
```

适合解决：

- 代理采购任务的完整闭环验证
- 多 seller 选择
- 审计和解释

## 5. 当前最重要的系统边界

当前必须坚持的几个边界如下：

1. 前端副驾不直接拥有交易状态
2. API route 不直接写业务编排逻辑
3. order state 只能由 orchestrator 推进
4. seller 交互必须经过 seller protocol
5. explanation 必须来自真实 audit trail

这些边界一旦被打破，系统就会从“代理交易骨架”退化回“堆叠功能的前后端 demo”。

## 6. 当前最大缺口

从工程视角看，当前最大缺口不是 UI，而是下面 5 个：

1. 扩展与 buyer API 还没正式接通
2. seller network 仍是本地模拟
3. memory store 没有升级为持久化系统
4. 真实支付 / 履约 / 异常恢复还没接
5. scenario-driven demand 还没升级为真实个人消费记忆

## 7. 推荐的下一步拆解

如果团队按系统优先级继续推进，建议顺序是：

### 第一步：打通前端副驾与 buyer API

目标：

- 让扩展不只展示建议
- 而是能真正创建结构化 buyer intent

### 第二步：把 seller-sim 替换为真实 seller adapter

目标：

- 从本地 seller catalog 进入真实 seller registry
- 让多 seller 比选走真实接入链路

### 第三步：升级 memory store

目标：

- 保存真实 order history
- 保存 explanation history
- 支持追溯和长期偏好

### 第四步：引入更真实的个人消费上下文

目标：

- 从 scenario 驱动升级为 user memory 驱动
- 真正进入“个人主代理”的方向

## 8. 结论

对团队来说，当前系统最重要的理解是：

**Claw Native 不是一个扩展加几个 API，而是一套以 orchestrator 为核心、以 seller protocol 为边界、以 auditability 为信任基础的代理电商系统。**

如果这套边界继续守住，后续每一层都可以逐步替换成更真实的生产组件；  
如果边界守不住，系统就会重新滑回“导购工具 + demo backend”的形态。
