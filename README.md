# OpenClaw Release V1

OpenClaw 是一个面向中文用户的 Agent Native 补货产品。它不是搜索框、聊天框，或者浏览器导购插件的壳，而是一个会替用户完成补货决策的本地可运行产品。

当前这版 `V1` 的发布面向两类场景：

- 主场景：家庭补货
- 次场景：办公室 / 小门店采购

这不是一个真实下单系统。它是一个可以稳定演示、可解释、可留资、可收集反馈的发布版产品。

## 发布版包含什么

- 一个默认展示家庭补货的 Web 产品：`apps/web`
- 一个支撑实时联调和反馈收集的本地 API：`apps/api`
- 一个本地 seller runtime：`apps/seller-sim`
- 一条真实运行的解释链：需求、策略、卖家选择、订单解释
- 两个真实可用的转化动作：
  - 提交反馈
  - 邮箱留资

## 快速开始

先安装依赖：

```bash
pnpm install
```

一条命令启动发布版：

```bash
pnpm start:release
```

启动后打开：

- [http://localhost:4174](http://localhost:4174)

如果你在迭代界面而不是做稳定演示，可以用开发模式：

```bash
pnpm dev:release
```

如果本地端口被占用，可以覆盖默认端口：

```bash
OPENCLAW_RELEASE_WEB_PORT=4274 \
OPENCLAW_RELEASE_API_PORT=4400 \
OPENCLAW_RELEASE_SELLER_PORT=4401 \
pnpm start:release
```

## 验证命令

发布版验证：

```bash
pnpm verify:release
```

浏览器发布流验证：

```bash
pnpm test:e2e:release
```

如果你需要单独运行某个服务：

```bash
pnpm start:api
pnpm start:seller-sim
pnpm dev:web
pnpm preview:web
```

## 反馈与留资

发布版会把反馈和候补邮箱写到本地目录：

- `.local/release-intake/feedback.jsonl`
- `.local/release-intake/interest.jsonl`

这个目录已经被 `.gitignore` 忽略，默认不会进入版本库。

## 架构入口

优先阅读下面几个文件：

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [Release V1 设计文档](./docs/plans/2026-03-29-openclaw-release-v1-design.md)
- [Release V1 实施计划](./docs/plans/2026-03-29-openclaw-release-v1.md)
- [Web 发布版说明](./docs/web-validation-console.md)

## 当前边界

这版发布不包含：

- 真实支付
- 真实商城接入
- 多用户系统
- 云端部署流水线
- browser extension 作为发布阻塞项

仓库里仍然保留 `apps/browser-extension` 和旧的验证资产，但它们不是当前 `V1` 的发布表面，也不会阻塞 `verify:release`。
