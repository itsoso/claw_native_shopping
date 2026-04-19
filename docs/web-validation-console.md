# OpenClaw Web Validation Console — 操作手册

单页 Web 演示台，用于向投资人 / 非技术观众证明 OpenClaw 的叙事：
**OpenClaw 不是帮用户浏览，而是代用户完成全流程**。

整页只有一屏，左侧是决策时间线，右侧是 Ops Dock（运行时切换 + 服务健康徽标）。

---

## 一、快速开始

```bash
pnpm install           # 首次运行或拉新代码后
pnpm dev:web           # http://127.0.0.1:5173 — 开发模式（带 HMR）
```

需要演示生产构建：

```bash
pnpm build:web
pnpm preview:web       # http://127.0.0.1:4174
```

页面顶部有一个 **开始演示** 按钮；左侧**场景**列表默认选中"补货：洗衣液"。按按钮即开始。

---

## 二、两种运行时

页面右上角 Ops Dock 有 `Demo` / `Live` 切换按钮。

### Demo（确定性演示）

- 数据源：`apps/web/src/runtime/demoRuntime.ts` 内置场景固件
- 不调用任何本地服务；Buyer API / Seller Sim 状态徽标永远显示 `ok`
- 五步固定时间线：Demand → Decision → Cart Plan → Seller Order → Explanation
- **用于**：演示不可失败、网络不稳、投资人现场

### Live（本地服务）

- 数据源：`apps/web/src/runtime/liveRuntime.ts`，先并行 probe `/health`，再打 `POST /intents/replenish` → `GET /orders/:id/explanation`
- 依赖本地两个 Fastify 服务：
  ```bash
  pnpm dev:api          # http://127.0.0.1:3000   buyer-api
  pnpm dev:seller-sim   # http://127.0.0.1:3100   seller-sim
  ```
- 任一服务的 `/health` 探测失败，页面会在 Ops Dock 显示"**服务不可用**"横幅，保留时间线兜底状态，不影响 Demo 模式
- **用于**：验证端到端管道、排查 orchestrator/seller-protocol 问题

### 健康探针契约

| 服务 | URL | 返回 |
|---|---|---|
| buyer-api | `http://127.0.0.1:3000/health` | `{"status":"ok","service":"buyer-api"}` |
| seller-sim | `http://127.0.0.1:3100/health` | `{"status":"ok","service":"seller-sim"}` |

Ops Dock 通过 `/health` 结果设置绿/红徽标；Live 运行开始时会先一次性探测两者。

---

## 三、投资人演示脚本建议

1. **开场**：加载页面，指向大标题（OpenClaw does not help users browse — it acts for them.），强调"不同叙事"
2. **Demo 跑一次**：在 Demo 下按"开始演示"；左侧出现五步 flow，右侧 Ops Dock 显示 `Demo / ok / ok`
3. **切换场景**：依次点击"凑单阈值"、"ETA 权衡"，展示同一条 pipeline 能覆盖不同业务形态
4. **切 Live**（可选，需已启动本地服务）：点击 Ops Dock 的 `Live`，再按"开始演示"；如果本地服务起着，流程跑真实 orchestrator；否则优雅降级到"服务不可用"，演示不中断
5. **收尾**：指出"解释"面板里的决策 tags — 体现 OpenClaw 的"决策 + 解释"组合能力

---

## 四、常见问题

**Q: Playwright smoke 如何跑？**
A: `pnpm test:e2e` 会自动 `build:web` + 启动 `vite preview`，然后在 `http://127.0.0.1:4174` 跑 `tests/e2e/web-validation-console.spec.ts`。

**Q: Live 模式"服务不可用"怎么排查？**
A: 确认两个进程都在（`pnpm dev:api` + `pnpm dev:seller-sim`），然后 `curl http://127.0.0.1:3000/health` / `curl http://127.0.0.1:3100/health` 应返回 `{status:"ok",...}`。

**Q: 加新 Scenario？**
A: 编辑 `apps/web/src/scenarios/index.ts` 的 `demoScenarios` 数组即可；Demo runtime 自动拾取；Live runtime 当前 MVP 不做 scenario 分支（后续版本由 orchestrator 决定）。
