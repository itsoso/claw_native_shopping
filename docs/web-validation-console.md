# OpenClaw Web 发布版说明

## 产品定位

OpenClaw Web 发布版是一个面向中文用户的 Agent Native 补货体验。默认故事是 `家庭补货`，次级故事是 `办公室 / 小门店采购`。

页面不是调试台，也不是投资人控制台。它应该让第一次打开的人完成三件事：

1. 看懂 OpenClaw 在做什么
2. 跑完一次完整演示
3. 提交反馈或留下邮箱

## 你会在页面里看到什么

首页主要分成四块：

- Hero：解释 OpenClaw 不是搜索和推荐，而是补货决策代理
- 场景区：家庭补货默认，办公室采购为辅
- 决策时间线：需求触发、策略判断、采购路径、卖家执行、决策解释
- 转化区：反馈表单和候补邮箱

## 启动方式

安装依赖：

```bash
pnpm install
```

稳定发布模式：

```bash
pnpm start:release
```

开发模式：

```bash
pnpm dev:release
```

页面默认地址：

- [http://localhost:4174](http://localhost:4174)

如果你的 `4300 / 4301 / 4174` 已经被占用，可以覆盖默认端口：

```bash
OPENCLAW_RELEASE_WEB_PORT=4274 \
OPENCLAW_RELEASE_API_PORT=4400 \
OPENCLAW_RELEASE_SELLER_PORT=4401 \
pnpm start:release
```

## 运行模式

### 演示模式

这是默认路径，也是最重要的产品路径。

- 不依赖本地服务健康状态
- 打开页面后可以直接开始演示
- 适合给潜在用户、合作方或朋友分享

推荐的演示顺序：

1. 保持在 `演示模式`
2. 用默认的家庭补货场景
3. 点击 `开始演示`
4. 展示时间线和订单解释
5. 提交一条反馈或留下邮箱

### 联调模式

联调模式用来证明页面背后是真实调用本地 buyer API 和 seller runtime，而不是纯前端假数据。

联调模式下页面会：

1. 调 `GET /health`
2. 调 `POST /intents/replenish`
3. 读取 `GET /orders/:id/explanation`
4. 把返回结果映射回同一套 UI

如果本地服务异常，页面会自动回退到 `演示模式`，而不是卡死在错误态。

## 本地反馈与留资

发布版内置两个真实表单：

- `POST /intake/feedback`
- `POST /intake/interest`

默认落盘目录：

- `.local/release-intake`

输出文件：

- `feedback.jsonl`
- `interest.jsonl`

## 推荐验证命令

发布版核心验证：

```bash
pnpm verify:release
```

浏览器发布流验证：

```bash
pnpm test:e2e:release
```

生产构建验证：

```bash
pnpm build:web
```

## 当前限制

这版发布仍然有清晰边界：

- 不是线上商城
- 不做真实支付
- 不做真实商品发布网络
- 不做浏览器插件首发

但它已经是一个完整、可运行、可测试、可分享的本地产品。
