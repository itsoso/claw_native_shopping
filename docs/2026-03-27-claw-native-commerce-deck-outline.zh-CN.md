# Claw Native 10 页以内路演 Deck 大纲

**用途：** 10 页以内融资 / 路演 deck 骨架  
**原则：** 每一页只回答一个问题，不在前 3 页过度讲技术细节

## Slide 1: Cover

### 标题

Claw Native  
用户主代理时代的消费交易底座

### 副标题

From shopping assistance to buyer-agent-first commerce.

### 页目标

一句话定义公司，不解释太多。

## Slide 2: Problem

### 标题

今天购物最大的成本，是决策，不是支付。

### 页面内容

- 高频消费和复购场景里，用户不断重复做相同决策
- 选规格、比卖家、看时效、算价格、判断是否值得现在下单
- 现有电商优化了供给和物流，但没有消灭决策负担

### 你在口头里讲

我们不是在解决“没有东西买”，而是在解决“完成购买任务太费脑”。

## Slide 3: Why Now

### 标题

电商入口正在从 App 迁移到 Agent。

### 页面内容

- 大模型让代理理解用户任务首次可用
- 用户开始接受把复杂任务交给 agent
- 电商领域还没有形成 buyer-agent-first 的默认入口

### 口头重点

这不是推荐系统的线性升级，而是交易入口范式迁移。

## Slide 4: Solution

### 标题

Claw Native 让代理替人完成消费决策与交易执行。

### 页面内容

- 用户侧：购物副驾
- 系统侧：buyer API + orchestrator + seller protocol
- 输出：从建议升级到结构化交易执行

### 页面表达建议

用一张简单链路图：

```text
用户任务 -> buyer intent -> seller 比选 -> policy -> hold -> commit -> explanation
```

## Slide 5: Product Today

### 标题

我们已经跑通了最小可运行闭环。

### 页面内容

- JD 购物副驾浏览器扩展
- buyer API
- procurement orchestrator
- seller-sim
- Web validation console

### 可加一行

当前已经能演示一条从结构化补货请求到 explanation 的完整链路。

## Slide 6: Demo Flow

### 标题

不是推荐商品，而是完成交易任务。

### 页面内容

```text
结构化补货请求
-> procurement intent
-> 多 seller quote
-> offer ranking
-> policy evaluation
-> hold inventory
-> commit order
-> explanation
```

### 口头重点

强调“多报价选择”“策略判断”“可解释执行”，不要把重点放在 UI 上。

## Slide 7: Why We Win

### 标题

真正的壁垒不在模型，而在交易编排。

### 页面内容

- buyer API 作为交易入口
- orchestrator 作为唯一交易大脑
- seller protocol 作为卖家边界
- explanation 作为信任基础

### 口头重点

别讲成“我们模型更好”，要讲成“我们系统位置更深”。

## Slide 8: Market Expansion

### 标题

从高频消费切入，走向更大的 agent commerce。

### 页面内容

1. 高频日用品复购
2. 家庭采购
3. 本地生活
4. 企业采购
5. 更广的 buyer-agent-first commerce network

### 口头重点

先小切口验证，长期不是小工具市场。

## Slide 9: Business Model

### 标题

从代理价值走向交易价值。

### 页面内容

- 早期：订阅 / 返佣 / 高频代理服务
- 中期：交易分成 / seller 接入
- 长期：agent commerce infrastructure

### 口头重点

商业模式不是单点广告或内容流量，而是围绕交易执行权展开。

## Slide 10: Ask / Vision

### 标题

构建用户主代理时代的消费交易底座。

### 页面内容

- 当前系统已验证最小闭环
- 下一步是打通真实 seller network 和生产级交易底座
- 本轮融资用于：工程扩展、真实网络接入、持久化与商业化验证

### 收尾句

Claw Native 不是更聪明的导购，而是用户主代理时代的消费交易底座。

## 附录：每页一句讲稿

### Slide 1

我们正在做的不是新的电商入口，而是用户默认的消费代理。

### Slide 2

今天购物最贵的不是价格，而是重复决策带来的时间和认知负担。

### Slide 3

交易入口会像搜索入口一样，被 agent 重写一遍。

### Slide 4

我们把购买任务从“人自己点”变成“代理可执行流程”。

### Slide 5

这不是概念图，我们已经把最小系统跑通了。

### Slide 6

系统已经能完成 seller 比选、策略判断、锁库存和 explanation。

### Slide 7

长期壁垒来自交易编排，不来自单次交互体验。

### Slide 8

我们先从最容易验证代理价值的高频消费切入。

### Slide 9

谁掌握交易执行权，谁就掌握长期商业价值。

### Slide 10

我们想占据的不是一个流量位，而是用户主代理背后的交易底座。
