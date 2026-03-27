# Claw Native 融资 BP 文案骨架

**用途：** 用于整理融资 BP 的正文，不是最终版排版  
**原则：** 先讲问题、再讲范式迁移、再讲架构优势、再讲阶段验证，避免把系统说成“AI 导购插件”

## 1. 封面一句话

Claw Native 正在构建用户主代理时代的消费交易底座，让代理替人完成越来越多的购买决策和交易执行。

可替换版本：

- Claw Native 是买方代理优先的 agent commerce 基础设施。
- Claw Native 让消费和购物从“人自己操作”走向“代理替人执行”。
- Claw Native 不是新的电商前台，而是用户主代理背后的交易操作系统。

## 2. 问题

### 标题建议

今天消费和购物的核心成本，不是支付，而是决策。

### 正文骨架

传统电商已经极大优化了商品供给、支付和物流，但用户在购买前仍然要重复做大量高频决策：

- 选什么
- 比什么
- 怎么买
- 哪个卖家更稳
- 现在下单是否最合适

尤其在高频复购和半标准化消费场景里，用户最浪费的不是钱，而是认知时间。  
这意味着下一代电商机会，不只是“更会推荐商品”，而是“替用户完成更多购买决策”。

### 可放的数据占位

- 用户平均每周消费决策次数：`[待填]`
- 高频复购场景占消费频次比例：`[待填]`
- 购物决策中用于比较、筛选、凑单的时间：`[待填]`

## 3. 机会判断

### 标题建议

电商入口正在从 App 迁移到 Agent。

### 正文骨架

我们判断，未来 5-10 年，消费交易会从：

- `App + 搜索 + 推荐`

迁移到：

- `Agent + 协议 + 编排`

也就是说，越来越多的用户不会自己逐步浏览和点击完成购买，而是把购买任务交给自己的主代理。  
谁先掌握用户长期偏好、结构化交易能力和 seller protocol，谁就更有机会占据新的交易入口。

### 一句话强化

Claw Native 不是电商流量逻辑，而是 agent transaction logic。

## 4. 解决方案

### 标题建议

Claw Native：买方代理优先的消费决策与交易执行系统

### 正文骨架

Claw Native 不是一个聊天机器人，也不是一个内容导购产品。  
它是一套让代理替用户完成购买任务的系统，包含两层：

1. 用户侧购物副驾  
运行在真实购物场景里，帮助用户完成“怎么买”的决策。

2. Native Commerce 后端  
接收结构化购买请求，完成 seller 比选、策略判断、锁库存、提交订单和 explanation。

### 能力列表

- 结构化 buyer intent
- seller quote collection
- 多 seller offer ranking
- policy-aware automation
- explanation 与审计

## 5. 产品形态

### 当前产品

- JD 购物副驾浏览器扩展
- Web validation console
- buyer API
- orchestrator
- seller-sim

### 未来产品形态

- 个人消费主代理
- 家庭采购代理
- 多 seller network 的 agent commerce layer
- 面向 B 端的采购 agent 输出

## 6. 为什么我们的系统不是普通 AI 电商工具

### 对比口径

传统 AI 导购产品：

- 给推荐
- 做总结
- 提供对话体验
- 最终仍然依赖用户自己完成交易

Claw Native：

- 接收任务
- 生成结构化 procurement intent
- 在 seller 之间自动比选
- 在 policy 下执行交易步骤
- 输出可回放 explanation

### 核心句

我们不是在优化“商品发现”，而是在重构“交易执行”。

## 7. 技术与架构优势

### 标题建议

真正的壁垒不在模型，而在交易编排。

### 正文骨架

Claw Native 当前已经建立了 agent commerce 的关键底层：

- buyer API：代理交易入口
- orchestrator：唯一交易编排大脑
- seller protocol：卖家交互边界
- offer evaluator：seller 选择机制
- policy engine：风险和授权边界
- memory / explanation：审计与信任基础

这意味着系统不是“把 AI 嵌进电商前台”，而是具备了向真实代理交易系统演进的骨架。

## 8. 当前进展

### 标题建议

我们已经把最小架构闭环跑通。

### 正文骨架

当前系统已完成：

- 浏览器扩展购物副驾 MVP
- buyer API
- Native Commerce orchestrator
- seller-sim
- seller protocol
- 多报价选择与排序
- explanation / snapshot
- Web validation console

### 可演示链路

```text
结构化补货请求
-> procurement intent
-> seller quote collection
-> offer ranking
-> policy evaluation
-> hold
-> commit
-> explanation
```

### 可放验证数据占位

- 演示链路成功率：`[待填]`
- 当前自动编排覆盖步骤数：`[待填]`
- 测试覆盖/关键验证项：`[待填]`

## 9. 市场切入

### 当前切入点

从城市白领高频消费和日用品复购切入。

### 原因

- 高频
- 决策成本高
- 风险较低
- 易于验证代理价值

### 扩展路径

1. 高频消费复购
2. 家庭采购
3. 本地生活
4. 更复杂的 agent commerce
5. 企业采购 / B 端 agent

## 10. 商业模式

### 早期

- 会员订阅
- 返佣 / CPS
- 高价值代理服务

### 中期

- 交易分成
- seller 接入费用
- 企业采购 agent 收费

### 长期

- agent commerce operating layer
- buyer-side transaction infrastructure

## 11. 为什么现在做这件事

### 可用口径

- 大模型让代理理解能力首次可用
- 用户正在逐步接受把复杂任务交给 agent
- 电商还没有形成 buyer-agent-first 的默认入口
- 现在是定义 seller protocol 和交易编排层的窗口期

## 12. 竞争与差异化

### 竞争对象不要只写“其他 AI 产品”

建议拆成三类：

1. 传统电商平台  
强在供给和交易，弱在 buyer-agent-first。

2. AI 导购 / 比价 / 推荐工具  
强在前台体验，弱在结构化交易执行。

3. 通用 AI 助手  
强在交互，弱在 commerce-specific protocol 和 orchestration。

### 我们的差异

- 从 buyer intent 出发
- 以交易编排为中心
- 强调 policy 和 explanation
- 能向真实 seller network 扩展

## 13. 路线图

### Phase 1

- 打磨购物副驾
- 验证高频消费场景
- 提升推荐接受率与复用率

### Phase 2

- 打通扩展与 buyer API
- 让更多前端动作进入结构化交易后端

### Phase 3

- 接入真实 seller network
- 替代 seller-sim
- 升级持久化订单存储

### Phase 4

- 扩展更多消费场景
- 形成 buyer-agent-first commerce network

## 14. 团队

### 建议讲法

团队的核心优势不只是做 AI 产品，而是：

- 能理解 agent interaction
- 能设计交易系统边界
- 能把前端产品验证和后端编排系统一起搭起来

如果你要补创始团队页，这一页建议强调：

- 产品技术能力
- agent system design 能力
- 电商/交易系统理解

## 15. 融资用途

### 模板

本轮融资将主要用于：

- 扩展核心工程团队
- 接入真实 seller network
- 建立生产级订单与审计底座
- 打通 C 端购物副驾与后端交易系统
- 扩大真实用户验证与商业化测试

## 16. 最后一页收尾句

可用收尾句：

- Claw Native 不是更聪明的导购，而是用户主代理时代的消费交易底座。
- 下一代电商入口，不是更强的搜索框，而是更可信的 buyer agent。
- 我们正在把“购物”从人手工操作，升级为代理可执行的结构化交易流程。
