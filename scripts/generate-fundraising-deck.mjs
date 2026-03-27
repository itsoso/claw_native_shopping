import fs from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";

const OUTPUT_DIR = path.resolve("docs/presentations");
const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  "2026-03-27-claw-native-commerce-fundraising-deck.pptx",
);

const COLORS = {
  navy: "1F2533",
  sand: "F4EBDD",
  terracotta: "B95E3C",
  charcoal: "202632",
  sage: "677C71",
  cream: "FBF7F1",
  white: "FFFFFF",
  muted: "6C6F75",
  paleTerracotta: "E8C8BA",
  paleSage: "D8E1DB",
  paleNavy: "DCE2EA",
};

const FONT_HEAD = "Aptos";
const FONT_BODY = "Aptos";
const TOTAL_SLIDES = 10;

const pptx = new PptxGenJS();
const SHAPE = pptx.ShapeType;

const ensureOutputDir = () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

const addPageChrome = (slide, pageNumber, total, options = {}) => {
  const isDark = options.dark ?? false;
  const labelFill = isDark ? COLORS.terracotta : COLORS.navy;
  const pageColor = isDark ? "DAD5CD" : COLORS.muted;

  slide.addShape(SHAPE.roundRect, {
    x: 0.55,
    y: 0.42,
    w: 1.7,
    h: 0.38,
    rectRadius: 0.08,
    line: { color: labelFill, transparency: 100 },
    fill: { color: labelFill },
  });
  slide.addText("CLAW NATIVE", {
    x: 0.68,
    y: 0.5,
    w: 1.45,
    h: 0.18,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 10,
    bold: true,
    charSpacing: 1.1,
    color: COLORS.white,
  });
  slide.addText("buyer-agent-first commerce", {
    x: 10.3,
    y: 0.48,
    w: 1.55,
    h: 0.18,
    margin: 0,
    align: "right",
    fontFace: FONT_BODY,
    fontSize: 9,
    italic: true,
    color: pageColor,
  });
  slide.addText(`${pageNumber}/${total}`, {
    x: 12.05,
    y: 0.48,
    w: 0.72,
    h: 0.18,
    margin: 0,
    align: "right",
    fontFace: FONT_BODY,
    fontSize: 10,
    color: pageColor,
  });

  if (!options.hideFooter) {
    slide.addText("Claw Native", {
      x: 0.68,
      y: 7.02,
      w: 1.4,
      h: 0.16,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 9,
      color: pageColor,
    });
  }
};

const addTitle = (slide, title, subtitle, options = {}) => {
  const x = options.x ?? 0.9;
  const y = options.y ?? 1.0;
  const w = options.w ?? 7.2;

  slide.addText(title, {
    x,
    y,
    w,
    h: 0.95,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: options.titleSize ?? 28,
    bold: true,
    color: options.titleColor ?? COLORS.charcoal,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x,
      y: y + 0.88,
      w,
      h: 0.42,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: options.subtitleSize ?? 12,
      color: options.subtitleColor ?? COLORS.muted,
    });
  }
};

const addBulletList = (slide, items, box, options = {}) => {
  const runs = items.map((item, index) => ({
    text: item,
    options: {
      bullet: true,
      breakLine: index !== items.length - 1,
    },
  }));

  slide.addText(runs, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: options.fontSize ?? 16,
    color: options.color ?? COLORS.charcoal,
    paraSpaceAfterPt: options.paraSpaceAfterPt ?? 12,
    valign: "top",
  });
};

const addCard = (slide, config) => {
  slide.addShape(SHAPE.roundRect, {
    x: config.x,
    y: config.y,
    w: config.w,
    h: config.h,
    rectRadius: config.radius ?? 0.07,
    line: { color: config.lineColor ?? config.fill, transparency: 100 },
    fill: { color: config.fill },
  });

  if (config.kicker) {
    slide.addText(config.kicker, {
      x: config.x + 0.24,
      y: config.y + 0.22,
      w: config.w - 0.48,
      h: 0.18,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 10,
      bold: true,
      charSpacing: 1.1,
      color: config.kickerColor ?? COLORS.terracotta,
    });
  }

  slide.addText(config.title, {
    x: config.x + 0.24,
    y: config.y + (config.kicker ? 0.5 : 0.26),
    w: config.w - 0.48,
    h: config.titleHeight ?? 0.6,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: config.titleSize ?? 18,
    bold: true,
    color: config.titleColor ?? COLORS.charcoal,
  });

  if (config.body) {
    slide.addText(config.body, {
      x: config.x + 0.24,
      y: config.y + (config.kicker ? 1.0 : 0.9),
      w: config.w - 0.48,
      h: config.bodyHeight ?? config.h - 1.12,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: config.bodySize ?? 12,
      color: config.bodyColor ?? COLORS.muted,
      valign: "top",
    });
  }
};

const addFlowNode = (slide, x, y, w, h, text, options = {}) => {
  slide.addShape(SHAPE.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.05,
    line: { color: options.lineColor ?? options.fill, transparency: 100 },
    fill: { color: options.fill ?? COLORS.white },
  });
  slide.addText(text, {
    x: x + 0.14,
    y: y + 0.18,
    w: w - 0.28,
    h: h - 0.36,
    margin: 0,
    align: "center",
    valign: "mid",
    fontFace: FONT_BODY,
    fontSize: options.fontSize ?? 12,
    bold: options.bold ?? true,
    color: options.color ?? COLORS.charcoal,
  });
};

const addChevron = (slide, x, y, w, h, color) => {
  slide.addShape(SHAPE.chevron, {
    x,
    y,
    w,
    h,
    line: { color, transparency: 100 },
    fill: { color },
  });
};

const addMiniWindow = (slide, x, y, w, h, title, lines, accent) => {
  slide.addShape(SHAPE.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.06,
    line: { color: accent, transparency: 100 },
    fill: { color: COLORS.cream },
  });
  slide.addShape(SHAPE.rect, {
    x,
    y,
    w,
    h: 0.34,
    line: { color: accent, transparency: 100 },
    fill: { color: accent },
  });
  slide.addText(title, {
    x: x + 0.22,
    y: y + 0.08,
    w: w - 0.44,
    h: 0.16,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 11,
    bold: true,
    color: COLORS.white,
  });
  lines.forEach((line, index) => {
    slide.addShape(SHAPE.roundRect, {
      x: x + 0.22,
      y: y + 0.68 + index * 0.55,
      w: w - 0.44,
      h: 0.38,
      rectRadius: 0.04,
      line: {
        color: index === 0 ? accent : COLORS.paleSage,
        transparency: 100,
      },
      fill: { color: index === 0 ? COLORS.paleTerracotta : COLORS.white },
    });
    slide.addText(line, {
      x: x + 0.34,
      y: y + 0.79 + index * 0.55,
      w: w - 0.68,
      h: 0.12,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 11,
      color: COLORS.charcoal,
    });
  });
};

const buildSlide1 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true, hideFooter: true });

  slide.addShape(SHAPE.ellipse, {
    x: 10.5,
    y: -0.1,
    w: 3.6,
    h: 3.6,
    line: { color: COLORS.paleTerracotta, transparency: 100 },
    fill: { color: COLORS.paleTerracotta, transparency: 78 },
  });
  slide.addShape(SHAPE.ellipse, {
    x: 9.7,
    y: 4.0,
    w: 4.4,
    h: 4.4,
    line: { color: COLORS.sage, transparency: 100 },
    fill: { color: COLORS.sage, transparency: 78 },
  });
  slide.addShape(SHAPE.roundRect, {
    x: 0.96,
    y: 5.68,
    w: 4.92,
    h: 0.62,
    rectRadius: 0.08,
    line: { color: COLORS.terracotta, transparency: 100 },
    fill: { color: COLORS.terracotta, transparency: 12 },
  });

  slide.addText("Claw Native", {
    x: 0.95,
    y: 1.64,
    w: 6.6,
    h: 0.68,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 31,
    bold: true,
    color: COLORS.white,
  });
  slide.addText("用户主代理时代的消费交易底座", {
    x: 0.95,
    y: 2.43,
    w: 8.4,
    h: 0.76,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 24,
    bold: true,
    color: "ECE5DB",
  });
  slide.addText("From shopping assistance to buyer-agent-first commerce", {
    x: 0.96,
    y: 3.47,
    w: 7.0,
    h: 0.3,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 14,
    italic: true,
    color: "D6CEC5",
  });
  slide.addText("让代理替用户完成越来越多的购买决策与交易执行", {
    x: 1.2,
    y: 5.89,
    w: 4.45,
    h: 0.14,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 12.5,
    color: COLORS.white,
  });
};

const buildSlide2 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.sand };
  addPageChrome(slide, page, TOTAL_SLIDES);
  addTitle(slide, "今天购物最大的成本，是决策，不是支付", "电商解决了供给和支付，但还没有解决决策负担。");

  addBulletList(
    slide,
    [
      "用户买东西最耗时间的，不是付款，而是反复比较和判断",
      "选规格、比卖家、看时效、算价格、决定是否现在下单",
      "尤其在高频复购场景里，这些动作被不断重复",
    ],
    { x: 0.96, y: 2.0, w: 5.45, h: 2.3 },
  );

  addCard(slide, {
    x: 0.96,
    y: 4.82,
    w: 5.15,
    h: 1.25,
    fill: COLORS.cream,
    kicker: "WHAT WE SEE",
    title: "购物流程被优化了，购物决策没有。",
    body: "这正是下一代消费代理的机会所在。",
  });

  const steps = ["打开商品页", "比卖家", "看时效", "算价格", "决定是否下单"];
  slide.addText("认知负担 / 时间消耗", {
    x: 7.1,
    y: 1.56,
    w: 4.9,
    h: 0.2,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
  });
  steps.forEach((step, index) => {
    const y = 1.95 + index * 0.78;
    slide.addShape(SHAPE.roundRect, {
      x: 7.1,
      y,
      w: 5.1,
      h: 0.56,
      rectRadius: 0.05,
      line: {
        color: index === steps.length - 1 ? COLORS.terracotta : COLORS.paleSage,
        transparency: 100,
      },
      fill: {
        color: index === steps.length - 1 ? COLORS.paleTerracotta : COLORS.cream,
      },
    });
    slide.addText(`${index + 1}`, {
      x: 7.35,
      y: y + 0.12,
      w: 0.28,
      h: 0.14,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 12,
      bold: true,
      color: COLORS.terracotta,
      align: "center",
    });
    slide.addText(step, {
      x: 7.82,
      y: y + 0.12,
      w: 3.8,
      h: 0.14,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 14,
      color: COLORS.charcoal,
    });
  });
};

const buildSlide3 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.cream };
  addPageChrome(slide, page, TOTAL_SLIDES);
  addTitle(slide, "电商入口，正在从 App 迁移到 Agent", "这不是搜索和推荐的迭代，而是交易入口范式迁移。");

  addCard(slide, {
    x: 0.96,
    y: 2.05,
    w: 5.55,
    h: 4.05,
    fill: COLORS.paleTerracotta,
    kicker: "OLD WORLD",
    title: "App + 搜索 + 推荐",
    titleSize: 22,
    body: "• 平台分发内容\n• 用户自己比较\n• 用户自己点击完成交易\n• 流量前台决定胜负",
    bodySize: 15,
    bodyHeight: 2.35,
  });
  addCard(slide, {
    x: 6.82,
    y: 2.05,
    w: 5.55,
    h: 4.05,
    fill: COLORS.paleSage,
    kicker: "NEW WORLD",
    kickerColor: COLORS.navy,
    title: "Agent + 协议 + 编排",
    titleSize: 22,
    body: "• 用户先交付任务\n• 代理完成 seller 选择\n• 交易通过协议执行\n• 编排层决定长期价值",
    bodySize: 15,
    bodyHeight: 2.35,
  });
};

const buildSlide4 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.sand };
  addPageChrome(slide, page, TOTAL_SLIDES);
  addTitle(
    slide,
    "Claw Native：买方代理优先的消费决策与交易执行系统",
    "我们不是在优化“看什么”，而是在重构“怎么买”。",
    { w: 8.8 },
  );

  const y = 2.58;
  addFlowNode(slide, 0.92, y, 1.55, 0.88, "用户任务", {
    fill: COLORS.navy,
    color: COLORS.white,
  });
  addChevron(slide, 2.58, y + 0.2, 0.34, 0.48, COLORS.terracotta);
  addFlowNode(slide, 2.98, y, 1.6, 0.88, "Buyer Intent", { fill: COLORS.cream });
  addChevron(slide, 4.67, y + 0.2, 0.34, 0.48, COLORS.terracotta);
  addFlowNode(slide, 5.06, y, 1.58, 0.88, "Seller 比选", { fill: COLORS.cream });
  addChevron(slide, 6.75, y + 0.2, 0.34, 0.48, COLORS.terracotta);
  addFlowNode(slide, 7.15, y, 1.38, 0.88, "Policy", { fill: COLORS.cream });
  addChevron(slide, 8.62, y + 0.2, 0.34, 0.48, COLORS.terracotta);
  addFlowNode(slide, 9.02, y, 1.24, 0.88, "Commit", { fill: COLORS.cream });
  addChevron(slide, 10.36, y + 0.2, 0.34, 0.48, COLORS.terracotta);
  addFlowNode(slide, 10.78, y, 1.6, 0.88, "Explanation", {
    fill: COLORS.terracotta,
    color: COLORS.white,
    fontSize: 11.5,
  });

  addCard(slide, {
    x: 1.0,
    y: 4.28,
    w: 3.75,
    h: 1.38,
    fill: COLORS.cream,
    kicker: "NOT",
    title: "AI 导购 / 比价工具 / 会聊天的电商助手",
    titleSize: 15.5,
    body: "",
  });
  addCard(slide, {
    x: 4.98,
    y: 4.28,
    w: 3.38,
    h: 1.38,
    fill: COLORS.paleSage,
    kicker: "IS",
    kickerColor: COLORS.navy,
    title: "购物副驾 + buyer API + orchestrator",
    titleSize: 15.5,
    body: "",
  });
  addCard(slide, {
    x: 8.6,
    y: 4.28,
    w: 3.65,
    h: 1.38,
    fill: COLORS.paleTerracotta,
    kicker: "OUTPUT",
    title: "从建议升级到结构化交易执行",
    titleSize: 15.5,
    body: "",
  });
};

const buildSlide5 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.cream };
  addPageChrome(slide, page, TOTAL_SLIDES);
  addTitle(slide, "当前产品已经跑通最小闭环", "这不是 PPT 架构，而是可以真实演示的最小系统。");

  addMiniWindow(slide, 0.98, 1.98, 5.35, 3.68, "用户侧 / JD 购物副驾", [
    "商品页一句话建议",
    "购物车执行方案",
    "本地偏好与事件存储",
    "真实购物现场入口层",
  ], COLORS.navy);
  addMiniWindow(slide, 7.0, 1.98, 5.35, 3.68, "系统侧 / Native Commerce Backend", [
    "buyer API",
    "procurement orchestrator",
    "seller-sim + seller protocol",
    "Web validation console",
  ], COLORS.terracotta);

  addChevron(slide, 6.35, 3.42, 0.38, 0.48, COLORS.sage);
  slide.addText("从用户现场到交易后端", {
    x: 4.86,
    y: 5.95,
    w: 3.5,
    h: 0.18,
    margin: 0,
    align: "center",
    fontFace: FONT_BODY,
    fontSize: 12,
    italic: true,
    color: COLORS.muted,
  });
};

const buildSlide6 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addTitle(
    slide,
    "系统已经能完成一条真实代理交易链路",
    "从建议到执行，中间不是黑箱，而是结构化链路。",
    { titleColor: COLORS.white, subtitleColor: "D6CEC5", w: 8.6 },
  );

  const labels = [
    "结构化补货请求",
    "Procurement Intent",
    "多 Seller Quote",
    "Offer Ranking",
    "Policy Evaluation",
    "Inventory Hold",
    "Order Commit",
    "Explanation",
  ];
  const fills = [
    COLORS.terracotta,
    "3D4658",
    COLORS.sage,
    COLORS.terracotta,
    "3D4658",
    COLORS.sage,
    COLORS.terracotta,
    COLORS.white,
  ];
  const textColors = [
    COLORS.white,
    COLORS.white,
    COLORS.white,
    COLORS.white,
    COLORS.white,
    COLORS.white,
    COLORS.white,
    COLORS.charcoal,
  ];
  labels.forEach((label, index) => {
    const x = 0.78 + index * 1.55;
    addFlowNode(slide, x, 3.15, 1.35, 1.05, label, {
      fill: fills[index],
      color: textColors[index],
      fontSize: 11,
    });
    if (index < labels.length - 1) {
      addChevron(slide, x + 1.37, 3.44, 0.22, 0.44, COLORS.paleTerracotta);
    }
  });

  addCard(slide, {
    x: 1.1,
    y: 5.25,
    w: 11.1,
    h: 1.05,
    fill: "2E3645",
    kicker: "KEY POINT",
    kickerColor: COLORS.paleTerracotta,
    title: "重点不是我们有页面，而是我们已经有了 seller 选择、策略判断和 explanation 这些代理式交易的核心步骤。",
    titleColor: COLORS.white,
    titleSize: 16,
    body: "",
  });
};

const buildSlide7 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.sand };
  addPageChrome(slide, page, TOTAL_SLIDES);
  addTitle(slide, "真正的壁垒，不在模型，而在交易编排", "长期护城河来自系统位置，而不是单次回答质量。");

  slide.addShape(SHAPE.ellipse, {
    x: 5.25,
    y: 2.35,
    w: 2.8,
    h: 2.8,
    line: { color: COLORS.terracotta, transparency: 100 },
    fill: { color: COLORS.terracotta },
  });
  slide.addText("Orchestrator", {
    x: 5.52,
    y: 3.12,
    w: 2.25,
    h: 0.35,
    margin: 0,
    align: "center",
    fontFace: FONT_HEAD,
    fontSize: 24,
    bold: true,
    color: COLORS.white,
  });
  slide.addText("single transaction brain", {
    x: 5.56,
    y: 3.55,
    w: 2.18,
    h: 0.16,
    margin: 0,
    align: "center",
    fontFace: FONT_BODY,
    fontSize: 10.5,
    italic: true,
    color: "F6EADF",
  });

  const modules = [
    { x: 0.95, y: 2.2, w: 3.1, h: 1.15, title: "buyer API", body: "代理交易入口", fill: COLORS.cream },
    { x: 0.95, y: 4.0, w: 3.1, h: 1.15, title: "seller protocol", body: "卖家交互边界", fill: COLORS.paleSage },
    { x: 9.28, y: 2.2, w: 3.1, h: 1.15, title: "offer evaluator", body: "多 seller 自动比选", fill: COLORS.cream },
    { x: 9.28, y: 4.0, w: 3.1, h: 1.15, title: "policy engine", body: "风险和授权控制", fill: COLORS.paleSage },
    { x: 4.0, y: 5.7, w: 5.25, h: 0.88, title: "explanation", body: "信任和追责基础", fill: COLORS.paleTerracotta },
  ];
  modules.forEach((module) => {
    addCard(slide, {
      ...module,
      kicker: "",
      titleSize: 18,
      bodySize: 12,
      bodyColor: COLORS.muted,
      titleHeight: 0.34,
      bodyHeight: 0.18,
    });
  });
};

const buildSlide8 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.cream };
  addPageChrome(slide, page, TOTAL_SLIDES);
  addTitle(slide, "我们从高频消费切入，但目标不是小工具市场", "从最容易验证代理价值的场景切入，向更大的 agent commerce 扩展。");

  const stairs = [
    { x: 1.0, y: 5.4, w: 2.0, h: 0.74, label: "高频日用品复购", fill: COLORS.paleTerracotta },
    { x: 3.05, y: 4.7, w: 2.1, h: 0.95, label: "家庭采购", fill: COLORS.paleSage },
    { x: 5.2, y: 3.85, w: 2.15, h: 1.15, label: "本地生活", fill: COLORS.paleTerracotta },
    { x: 7.4, y: 2.85, w: 2.2, h: 1.35, label: "企业采购", fill: COLORS.paleSage },
    { x: 9.65, y: 1.65, w: 2.55, h: 1.65, label: "Agent Commerce Network", fill: COLORS.navy, color: COLORS.white },
  ];
  stairs.forEach((step) => {
    addCard(slide, {
      x: step.x,
      y: step.y,
      w: step.w,
      h: step.h,
      fill: step.fill,
      kicker: "",
      title: step.label,
      titleColor: step.color ?? COLORS.charcoal,
      titleSize: step.label.includes("Network") ? 16 : 18,
      titleHeight: 0.54,
      body: "",
    });
  });

  slide.addText("切入顺序", {
    x: 1.0,
    y: 1.6,
    w: 2.0,
    h: 0.2,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
  });
};

const buildSlide9 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.sand };
  addPageChrome(slide, page, TOTAL_SLIDES);
  addTitle(slide, "商业模式会从代理价值，走向交易价值", "谁掌握交易执行权，谁就掌握长期商业价值。");

  addCard(slide, {
    x: 0.96,
    y: 2.05,
    w: 3.7,
    h: 3.95,
    fill: COLORS.cream,
    kicker: "EARLY",
    title: "会员订阅\n返佣 / CPS\n高频代理服务",
    titleSize: 20,
    titleHeight: 1.6,
    body: "围绕“帮用户更快完成购买任务”建立早期付费和交易验证。",
    bodySize: 13,
  });
  addCard(slide, {
    x: 4.82,
    y: 2.05,
    w: 3.7,
    h: 3.95,
    fill: COLORS.paleSage,
    kicker: "MID",
    kickerColor: COLORS.navy,
    title: "交易分成\nseller 接入\n企业采购 agent 收费",
    titleSize: 20,
    titleHeight: 1.6,
    body: "围绕更深层的代理交易执行权建立平台化收入结构。",
    bodySize: 13,
  });
  addCard(slide, {
    x: 8.68,
    y: 2.05,
    w: 3.7,
    h: 3.95,
    fill: COLORS.paleTerracotta,
    kicker: "LONG TERM",
    title: "Agent Commerce Infrastructure",
    titleSize: 20,
    titleHeight: 0.9,
    body: "从单点产品走向 buyer-side transaction operating layer。",
    bodySize: 13,
  });
};

const buildSlide10 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true, hideFooter: true });

  slide.addText("我们想占据的，不是新的流量位，", {
    x: 0.95,
    y: 1.35,
    w: 9.6,
    h: 0.5,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 28,
    bold: true,
    color: COLORS.white,
  });
  slide.addText("而是主代理背后的交易底座", {
    x: 0.95,
    y: 1.92,
    w: 8.6,
    h: 0.58,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 31,
    bold: true,
    color: "ECE5DB",
  });

  const nextSteps = [
    { x: 0.96, title: "真实 seller network", body: "替代 seller-sim，进入真实协议接入。 " },
    { x: 4.46, title: "前端与 buyer API 打通", body: "让购物副驾进入真实代理交易后端。 " },
    { x: 7.96, title: "生产级交易底座", body: "升级持久化、审计与商业化验证。 " },
  ];
  nextSteps.forEach((item) => {
    addCard(slide, {
      x: item.x,
      y: 4.15,
      w: 3.15,
      h: 1.68,
      fill: "2F3848",
      kicker: "NEXT",
      kickerColor: COLORS.paleTerracotta,
      title: item.title,
      titleColor: COLORS.white,
      titleSize: 16,
      body: item.body,
      bodyColor: "D6CEC5",
      bodySize: 11.5,
    });
  });

  slide.addShape(SHAPE.roundRect, {
    x: 0.96,
    y: 6.35,
    w: 6.65,
    h: 0.72,
    rectRadius: 0.08,
    line: { color: COLORS.terracotta, transparency: 100 },
    fill: { color: COLORS.terracotta, transparency: 10 },
  });
  slide.addText("Claw Native 不是更聪明的导购，而是用户主代理时代的消费交易底座。", {
    x: 1.22,
    y: 6.56,
    w: 6.15,
    h: 0.18,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 13,
    color: COLORS.white,
  });
};

const buildDeck = () => {
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "Claw Native";
  pptx.subject = "Fundraising deck";
  pptx.title = "Claw Native Fundraising Deck";
  pptx.lang = "zh-CN";
  pptx.theme = {
    headFontFace: FONT_HEAD,
    bodyFontFace: FONT_BODY,
    lang: "zh-CN",
  };

  buildSlide1(1);
  buildSlide2(2);
  buildSlide3(3);
  buildSlide4(4);
  buildSlide5(5);
  buildSlide6(6);
  buildSlide7(7);
  buildSlide8(8);
  buildSlide9(9);
  buildSlide10(10);
};

const main = async () => {
  ensureOutputDir();
  buildDeck();
  await pptx.writeFile({ fileName: OUTPUT_FILE });
  console.log(OUTPUT_FILE);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
