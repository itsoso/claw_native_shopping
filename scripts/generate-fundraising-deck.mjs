import fs from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";

const OUTPUT_DIR = path.resolve("docs/presentations");
const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  "2026-03-27-claw-native-commerce-fundraising-deck.pptx",
);

const COLORS = {
  ink: "11161F",
  panel: "1B2230",
  panelSoft: "232C3C",
  line: "343E51",
  bronze: "A56A45",
  bronzeSoft: "C8A083",
  ivory: "F1E9DE",
  mist: "C8C0B4",
  muted: "98A1AF",
  slate: "657082",
  sage: "6A7A72",
  white: "FFFFFF",
  black: "0B0F14",
};

const FONT_HEAD = "Georgia";
const FONT_BODY = "Aptos";
const TOTAL_SLIDES = 10;
const SPEAKER_NOTES = [
  [
    "我们做的不是一个更会推荐商品的电商前台。",
    "我们要占据的是用户主代理背后的消费交易底座位置。",
  ].join("\n\n"),
  [
    "今天购物真正贵的，不是支付动作，而是反复比较和判断的时间与脑力。",
    "下一代电商的机会，不只是继续优化推荐，而是直接减少用户完成购买任务所需的认知劳动。",
  ].join("\n\n"),
  [
    "过去的入口是 App、搜索和推荐，用户自己完成点击与决策。",
    "未来用户会先把任务交给 Agent，再由 Agent 决定在哪里买、怎么买、什么时候买。",
  ].join("\n\n"),
  [
    "Claw Native 不是 AI 导购，不是比价工具，也不是会聊天的电商助手。",
    "我们把购买任务从页面操作流程升级成结构化代理流程，从而重构“怎么买”。",
  ].join("\n\n"),
  [
    "这套系统已经不是概念图，而是能真实演示的最小闭环。",
    "一端贴近用户真实购物现场，一端验证代理交易后端，二者已经连接起来。",
  ].join("\n\n"),
  [
    "重点不是我们有页面，而是系统已经具备 seller 比选、策略判断和 explanation 这些代理式交易的核心步骤。",
    "从建议到执行，中间不是黑箱，而是一条可回放、可审计的结构化链路。",
  ].join("\n\n"),
  [
    "真正的壁垒不是单次回答质量，而是交易编排的位置。",
    "如果我们占据 buyer-agent-first 的编排层，位置会比单点前台产品深得多。",
  ].join("\n\n"),
  [
    "我们不是从大而全开始，而是从最能建立用户信任的高频消费任务切入。",
    "先验证代理价值，再扩展到更多 category、seller 和协议层。",
  ].join("\n\n"),
  [
    "商业模式不会停留在内容流量，而会沿着代理实际替用户完成的交易深度向上走。",
    "谁掌握交易执行权，谁就掌握长期商业价值。",
  ].join("\n\n"),
  [
    "我们不是在做一个更强的前台，而是在定义 Agent 时代新的交易操作系统。",
    "Claw Native 想占据的是主代理时代的交易底座位置。",
  ].join("\n\n"),
];

const pptx = new PptxGenJS();
const SHAPE = pptx.ShapeType;

const ensureOutputDir = () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

const addBackgroundMotif = (slide) => {
  slide.addShape(SHAPE.ellipse, {
    x: 10.3,
    y: -0.3,
    w: 3.9,
    h: 3.9,
    line: { color: COLORS.bronze, transparency: 100 },
    fill: { color: COLORS.bronze, transparency: 86 },
  });
  slide.addShape(SHAPE.ellipse, {
    x: 9.45,
    y: 4.35,
    w: 4.85,
    h: 4.85,
    line: { color: COLORS.sage, transparency: 100 },
    fill: { color: COLORS.sage, transparency: 88 },
  });
};

const addPageChrome = (slide, pageNumber, total, options = {}) => {
  const dark = options.dark ?? true;
  const metaColor = dark ? COLORS.mist : COLORS.slate;
  const badgeFill = dark ? COLORS.bronze : COLORS.ink;

  slide.addShape(SHAPE.roundRect, {
    x: 0.58,
    y: 0.42,
    w: 1.62,
    h: 0.36,
    rectRadius: 0.08,
    line: { color: badgeFill, transparency: 100 },
    fill: { color: badgeFill },
  });
  slide.addText("CLAW NATIVE", {
    x: 0.72,
    y: 0.505,
    w: 1.34,
    h: 0.14,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 10.5,
    bold: true,
    charSpacing: 1.15,
    color: COLORS.white,
  });
  slide.addText("buyer-agent-first commerce", {
    x: 10.15,
    y: 0.47,
    w: 1.75,
    h: 0.16,
    margin: 0,
    align: "right",
    fontFace: FONT_BODY,
    fontSize: 8.5,
    italic: true,
    color: metaColor,
  });
  slide.addText(`${pageNumber}/${total}`, {
    x: 12.0,
    y: 0.47,
    w: 0.7,
    h: 0.16,
    margin: 0,
    align: "right",
    fontFace: FONT_BODY,
    fontSize: 10,
    color: metaColor,
  });

  if (!options.hideFooter) {
    slide.addText("Claw Native", {
      x: 0.72,
      y: 7.0,
      w: 1.4,
      h: 0.14,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 8.5,
      color: metaColor,
    });
  }
};

const addTitle = (slide, title, subtitle, options = {}) => {
  slide.addText(title, {
    x: options.x ?? 0.96,
    y: options.y ?? 1.02,
    w: options.w ?? 8.8,
    h: options.h ?? 0.78,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: options.titleSize ?? 27,
    bold: true,
    color: options.titleColor ?? COLORS.ivory,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: options.x ?? 0.96,
      y: (options.y ?? 1.02) + (options.subtitleOffset ?? 0.86),
      w: options.w ?? 8.8,
      h: 0.34,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: options.subtitleSize ?? 11.5,
      color: options.subtitleColor ?? COLORS.mist,
    });
  }
};

const addPanel = (slide, options) => {
  slide.addShape(SHAPE.roundRect, {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    rectRadius: options.radius ?? 0.06,
    line: {
      color: options.lineColor ?? COLORS.line,
      width: options.lineWidth ?? 1,
      transparency: options.lineTransparency ?? 0,
    },
    fill: {
      color: options.fill ?? COLORS.panel,
      transparency: options.fillTransparency ?? 0,
    },
  });
};

const addKicker = (slide, text, box, options = {}) => {
  slide.addText(text, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: 0.16,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: options.fontSize ?? 9.5,
    bold: true,
    charSpacing: options.charSpacing ?? 1.1,
    color: options.color ?? COLORS.bronzeSoft,
  });
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
    fontSize: options.fontSize ?? 15,
    color: options.color ?? COLORS.ivory,
    paraSpaceAfterPt: options.paraSpaceAfterPt ?? 11,
    valign: "top",
  });
};

const addCard = (slide, config) => {
  addPanel(slide, {
    x: config.x,
    y: config.y,
    w: config.w,
    h: config.h,
    fill: config.fill ?? COLORS.panel,
    fillTransparency: config.fillTransparency ?? 0,
    lineColor: config.lineColor ?? COLORS.line,
    lineWidth: config.lineWidth ?? 1,
    radius: config.radius ?? 0.06,
  });

  if (config.kicker) {
    addKicker(
      slide,
      config.kicker,
      { x: config.x + 0.24, y: config.y + 0.22, w: config.w - 0.48 },
      { color: config.kickerColor ?? COLORS.bronzeSoft },
    );
  }

  slide.addText(config.title, {
    x: config.x + 0.24,
    y: config.y + (config.kicker ? 0.48 : 0.24),
    w: config.w - 0.48,
    h: config.titleHeight ?? 0.62,
    margin: 0,
    fontFace: config.titleFont ?? FONT_HEAD,
    fontSize: config.titleSize ?? 18,
    bold: true,
    color: config.titleColor ?? COLORS.ivory,
    valign: "mid",
  });

  if (config.body) {
    slide.addText(config.body, {
      x: config.x + 0.24,
      y: config.y + (config.kicker ? 1.0 : 0.92),
      w: config.w - 0.48,
      h: config.bodyHeight ?? config.h - 1.18,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: config.bodySize ?? 11.5,
      color: config.bodyColor ?? COLORS.mist,
      valign: "top",
    });
  }
};

const addMetric = (slide, config) => {
  addPanel(slide, {
    x: config.x,
    y: config.y,
    w: config.w,
    h: config.h,
    fill: COLORS.panel,
    lineColor: COLORS.line,
    radius: 0.05,
  });
  addKicker(
    slide,
    config.label,
    { x: config.x + 0.2, y: config.y + 0.2, w: config.w - 0.4 },
    { color: COLORS.muted, fontSize: 8.8, charSpacing: 1.2 },
  );
  slide.addText(config.value, {
    x: config.x + 0.2,
    y: config.y + 0.45,
    w: config.w - 0.4,
    h: 0.48,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: config.valueSize ?? 21,
    bold: true,
    color: COLORS.ivory,
  });
  if (config.note) {
    slide.addText(config.note, {
      x: config.x + 0.2,
      y: config.y + config.h - 0.38,
      w: config.w - 0.4,
      h: 0.16,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 9.5,
      color: COLORS.mist,
    });
  }
};

const addFlowNode = (slide, x, y, w, h, text, options = {}) => {
  addPanel(slide, {
    x,
    y,
    w,
    h,
    fill: options.fill ?? COLORS.panel,
    lineColor: options.lineColor ?? COLORS.line,
    radius: 0.05,
  });
  slide.addText(text, {
    x: x + 0.14,
    y: y + 0.18,
    w: w - 0.28,
    h: h - 0.34,
    margin: 0,
    align: "center",
    valign: "mid",
    fontFace: FONT_BODY,
    fontSize: options.fontSize ?? 11.5,
    bold: options.bold ?? true,
    color: options.color ?? COLORS.ivory,
  });
};

const addConnector = (slide, x, y, w, color = COLORS.bronze) => {
  slide.addShape(SHAPE.line, {
    x,
    y,
    w,
    h: 0,
    line: { color, width: 1.8, beginArrowType: "none", endArrowType: "triangle" },
  });
};

const addMiniWindow = (slide, x, y, w, h, title, lines, accent = COLORS.bronze) => {
  addPanel(slide, {
    x,
    y,
    w,
    h,
    fill: COLORS.panel,
    lineColor: COLORS.line,
    radius: 0.06,
  });
  slide.addShape(SHAPE.rect, {
    x,
    y,
    w,
    h: 0.34,
    line: { color: accent, transparency: 100 },
    fill: { color: accent, transparency: 4 },
  });
  slide.addText(title, {
    x: x + 0.22,
    y: y + 0.09,
    w: w - 0.44,
    h: 0.15,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 11,
    bold: true,
    color: COLORS.ivory,
  });
  lines.forEach((line, index) => {
    addPanel(slide, {
      x: x + 0.22,
      y: y + 0.68 + index * 0.57,
      w: w - 0.44,
      h: 0.38,
      fill: index === 0 ? COLORS.panelSoft : COLORS.ink,
      lineColor: index === 0 ? accent : COLORS.line,
      radius: 0.035,
    });
    slide.addText(line, {
      x: x + 0.36,
      y: y + 0.79 + index * 0.57,
      w: w - 0.72,
      h: 0.12,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 10.5,
      color: COLORS.ivory,
    });
  });
};

const addSpeakerNotes = (slide, pageNumber) => {
  slide.addNotes(SPEAKER_NOTES[pageNumber - 1]);
};

const buildSlide1 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addBackgroundMotif(slide);
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true, hideFooter: true });
  addSpeakerNotes(slide, page);

  slide.addText("Claw Native", {
    x: 0.96,
    y: 1.56,
    w: 4.8,
    h: 0.62,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 29,
    bold: true,
    color: COLORS.white,
  });
  slide.addText("用户主代理时代的消费交易底座", {
    x: 0.96,
    y: 2.45,
    w: 7.7,
    h: 0.72,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 24,
    bold: true,
    color: COLORS.ivory,
  });
  slide.addText("From shopping assistance to buyer-agent-first commerce", {
    x: 0.98,
    y: 3.45,
    w: 6.2,
    h: 0.24,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 13.5,
    italic: true,
    color: COLORS.mist,
  });
  addPanel(slide, {
    x: 0.98,
    y: 5.74,
    w: 4.95,
    h: 0.58,
    fill: COLORS.bronze,
    fillTransparency: 8,
    lineColor: COLORS.bronze,
    radius: 0.08,
  });
  slide.addText("让代理替用户完成越来越多的购买决策与交易执行", {
    x: 1.22,
    y: 5.93,
    w: 4.42,
    h: 0.14,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 12.2,
    color: COLORS.white,
  });
};

const buildSlide2 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addSpeakerNotes(slide, page);
  addTitle(
    slide,
    "今天购物最大的成本，是决策，不是支付",
    "电商解决了供给与支付，但还没有解决高频消费里的判断负担。",
  );

  addKicker(slide, "DECISION LOAD", { x: 0.98, y: 2.1, w: 2.3 });
  slide.addText("用户浪费的不是钱，而是可复用的注意力。", {
    x: 0.98,
    y: 2.4,
    w: 5.3,
    h: 0.56,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 22,
    bold: true,
    color: COLORS.ivory,
  });
  addBulletList(
    slide,
    [
      "选规格、比卖家、看时效、算价格、判断是否现在下单",
      "这些动作在高频复购场景里被持续重复，却没有被真正托管",
      "所以交易入口会从 App 页面，迁移到能替用户做决定的主代理",
    ],
    { x: 0.98, y: 3.28, w: 5.45, h: 2.2 },
    { fontSize: 14.5 },
  );

  const steps = [
    { label: "打开商品页", width: 3.7 },
    { label: "反复比较卖家与规格", width: 4.4 },
    { label: "重新计算到手价与时效", width: 4.85 },
    { label: "决定是否凑单 / 延迟下单", width: 5.3 },
  ];
  addKicker(slide, "REPEATED MANUAL STEPS", { x: 7.05, y: 2.1, w: 3.0 });
  steps.forEach((step, index) => {
    const y = 2.55 + index * 0.82;
    addPanel(slide, {
      x: 7.05,
      y,
      w: step.width,
      h: 0.54,
      fill: index === steps.length - 1 ? COLORS.bronze : COLORS.panelSoft,
      fillTransparency: index === steps.length - 1 ? 16 : 0,
      lineColor: index === steps.length - 1 ? COLORS.bronze : COLORS.line,
      radius: 0.05,
    });
    slide.addText(`${index + 1}`, {
      x: 7.28,
      y: y + 0.13,
      w: 0.24,
      h: 0.12,
      margin: 0,
      align: "center",
      fontFace: FONT_BODY,
      fontSize: 11,
      bold: true,
      color: COLORS.ivory,
    });
    slide.addText(step.label, {
      x: 7.7,
      y: y + 0.125,
      w: step.width - 0.9,
      h: 0.14,
      margin: 0,
      fontFace: FONT_BODY,
      fontSize: 13,
      color: COLORS.ivory,
    });
  });
};

const buildSlide3 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addSpeakerNotes(slide, page);
  addTitle(
    slide,
    "电商入口，正在从 App 迁移到 Agent",
    "这不是搜索和推荐的迭代，而是交易入口范式迁移。",
  );

  addCard(slide, {
    x: 0.98,
    y: 2.05,
    w: 5.55,
    h: 3.95,
    fill: COLORS.panel,
    kicker: "OLD WORLD",
    title: "App + 搜索 + 推荐",
    titleSize: 22,
    body: "• 平台分发内容\n• 用户自己比较\n• 用户自己点击完成交易\n• 流量前台决定胜负",
    bodySize: 14.5,
    bodyHeight: 2.2,
  });
  addCard(slide, {
    x: 6.83,
    y: 2.05,
    w: 5.55,
    h: 3.95,
    fill: COLORS.panelSoft,
    lineColor: COLORS.bronze,
    kicker: "NEW WORLD",
    title: "Agent + 协议 + 编排",
    titleSize: 22,
    body: "• 用户先交付任务\n• 代理自动完成 seller 选择\n• 交易通过协议执行\n• 编排层决定长期价值",
    bodySize: 14.5,
    bodyHeight: 2.2,
  });
  addPanel(slide, {
    x: 4.78,
    y: 3.45,
    w: 3.25,
    h: 0.42,
    fill: COLORS.bronze,
    fillTransparency: 6,
    lineColor: COLORS.bronze,
    radius: 0.21,
  });
  slide.addText("入口从“看什么”迁移到“怎么买”", {
    x: 5.02,
    y: 3.59,
    w: 2.77,
    h: 0.12,
    margin: 0,
    align: "center",
    fontFace: FONT_BODY,
    fontSize: 10.5,
    bold: true,
    color: COLORS.white,
  });
};

const buildSlide4 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addSpeakerNotes(slide, page);
  addTitle(
    slide,
    "Claw Native：买方代理优先的消费决策与交易执行系统",
    "我们不是在优化“看什么”，而是在重构“怎么买”。",
    { w: 9.2 },
  );

  const labels = [
    "用户任务",
    "Buyer Intent",
    "Seller 比选",
    "Policy",
    "Commit",
    "Explanation",
  ];
  const fills = [
    COLORS.bronze,
    COLORS.panelSoft,
    COLORS.panelSoft,
    COLORS.panelSoft,
    COLORS.panelSoft,
    COLORS.panel,
  ];
  labels.forEach((label, index) => {
    const x = 0.94 + index * 1.95;
    addFlowNode(slide, x, 2.85, 1.55, 0.92, label, {
      fill: fills[index],
      lineColor: index === 0 ? COLORS.bronze : COLORS.line,
      color: COLORS.ivory,
      fontSize: 11.5,
    });
    if (index < labels.length - 1) {
      addConnector(slide, x + 1.57, 3.3, 0.3);
    }
  });

  addCard(slide, {
    x: 0.98,
    y: 4.42,
    w: 3.66,
    h: 1.42,
    fill: COLORS.panel,
    kicker: "NOT",
    title: "AI 导购 / 比价工具 / 会聊天的电商助手",
    titleSize: 15.5,
    body: "",
  });
  addCard(slide, {
    x: 4.86,
    y: 4.42,
    w: 3.15,
    h: 1.42,
    fill: COLORS.panelSoft,
    kicker: "IS",
    kickerColor: COLORS.bronzeSoft,
    title: "购物副驾 + buyer API + orchestrator",
    titleSize: 15.5,
    body: "",
  });
  addCard(slide, {
    x: 8.23,
    y: 4.42,
    w: 4.0,
    h: 1.42,
    fill: COLORS.panel,
    lineColor: COLORS.bronze,
    kicker: "OUTPUT",
    title: "从建议升级到结构化交易执行",
    titleSize: 15.5,
    body: "",
  });
};

const buildSlide5 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addSpeakerNotes(slide, page);
  addTitle(slide, "当前产品已经跑通最小闭环", "这不是 PPT 架构，而是可以真实演示的最小系统。");

  addMiniWindow(slide, 0.98, 2.04, 4.85, 3.78, "用户侧 / JD 购物副驾", [
    "商品页一句话建议",
    "购物车执行方案",
    "本地偏好与事件存储",
    "真实购物现场入口层",
  ]);
  addMiniWindow(slide, 6.02, 2.04, 4.85, 3.78, "系统侧 / Native Commerce Backend", [
    "buyer API",
    "procurement orchestrator",
    "seller-sim + seller protocol",
    "Web validation console",
  ], COLORS.sage);
  addMetric(slide, {
    x: 11.1,
    y: 2.04,
    w: 1.18,
    h: 1.02,
    label: "SURFACES",
    value: "4",
    note: "真实运行层",
  });
  addMetric(slide, {
    x: 11.1,
    y: 3.22,
    w: 1.18,
    h: 1.02,
    label: "FLOW",
    value: "1",
    note: "端到端闭环",
  });
  addMetric(slide, {
    x: 11.1,
    y: 4.4,
    w: 1.18,
    h: 1.02,
    label: "GOAL",
    value: "MVP",
    valueSize: 16,
    note: "可验证代理价值",
  });
};

const buildSlide6 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addSpeakerNotes(slide, page);
  addTitle(
    slide,
    "系统已经能完成一条真实代理交易链路",
    "从建议到执行，中间不是黑箱，而是结构化链路。",
  );

  const nodes = [
    "补货请求",
    "Procurement Intent",
    "多 Seller Quote",
    "Offer Ranking",
    "Policy",
    "Inventory Hold",
    "Commit",
    "Explanation",
  ];
  nodes.forEach((node, index) => {
    const x = 0.76 + index * 1.53;
    addFlowNode(slide, x, 2.95, 1.3, 0.98, node, {
      fill: index === 0 || index === 3 || index === 6 ? COLORS.bronze : COLORS.panelSoft,
      lineColor: index === 0 || index === 3 || index === 6 ? COLORS.bronze : COLORS.line,
      fontSize: 10.5,
    });
    if (index < nodes.length - 1) {
      addConnector(slide, x + 1.32, 3.44, 0.19, COLORS.bronzeSoft);
    }
  });

  addCard(slide, {
    x: 0.98,
    y: 4.72,
    w: 5.72,
    h: 1.4,
    fill: COLORS.panel,
    kicker: "WHY THIS MATTERS",
    title: "核心不是页面，而是 seller 选择、策略判断和 commit 这些代理式交易步骤已经真实存在。",
    titleSize: 16,
    body: "",
  });
  addCard(slide, {
    x: 6.95,
    y: 4.72,
    w: 5.3,
    h: 1.4,
    fill: COLORS.panelSoft,
    lineColor: COLORS.bronze,
    kicker: "AUDITABILITY",
    title: "每一步都能被 explanation 回放，这才是后续托管额度与自动执行的信任基础。",
    titleSize: 16,
    body: "",
  });
};

const buildSlide7 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addSpeakerNotes(slide, page);
  addTitle(slide, "真正的壁垒，不在模型，而在交易编排", "长期护城河来自系统位置，而不是单次回答质量。");

  slide.addShape(SHAPE.ellipse, {
    x: 5.18,
    y: 2.25,
    w: 2.95,
    h: 2.95,
    line: { color: COLORS.bronze, width: 1.4 },
    fill: { color: COLORS.panelSoft },
  });
  slide.addText("Orchestrator", {
    x: 5.53,
    y: 3.08,
    w: 2.26,
    h: 0.34,
    margin: 0,
    align: "center",
    fontFace: FONT_HEAD,
    fontSize: 23,
    bold: true,
    color: COLORS.ivory,
  });
  slide.addText("single transaction brain", {
    x: 5.42,
    y: 3.52,
    w: 2.48,
    h: 0.14,
    margin: 0,
    align: "center",
    fontFace: FONT_BODY,
    fontSize: 10,
    italic: true,
    color: COLORS.mist,
  });

  const cards = [
    { x: 0.98, y: 2.22, w: 3.2, h: 1.18, title: "buyer API", body: "代理交易入口" },
    { x: 0.98, y: 4.02, w: 3.2, h: 1.18, title: "seller protocol", body: "卖家交互边界" },
    { x: 9.12, y: 2.22, w: 3.2, h: 1.18, title: "offer evaluator", body: "多 seller 自动比选" },
    { x: 9.12, y: 4.02, w: 3.2, h: 1.18, title: "policy engine", body: "风险和授权控制" },
  ];
  cards.forEach((card) => {
    addCard(slide, {
      ...card,
      fill: COLORS.panel,
      kicker: "",
      titleSize: 17,
      titleHeight: 0.32,
      bodySize: 11.5,
      bodyHeight: 0.16,
    });
  });

  addConnector(slide, 4.2, 2.82, 0.92, COLORS.line);
  addConnector(slide, 4.2, 4.62, 0.92, COLORS.line);
  addConnector(slide, 8.12, 2.82, 0.92, COLORS.line);
  addConnector(slide, 8.12, 4.62, 0.92, COLORS.line);

  addCard(slide, {
    x: 3.72,
    y: 5.76,
    w: 5.85,
    h: 0.88,
    fill: COLORS.panelSoft,
    lineColor: COLORS.bronze,
    kicker: "MOAT",
    title: "位置、状态、解释能力叠加起来，才形成主代理时代的交易护城河。",
    titleSize: 14.5,
    body: "",
  });
};

const buildSlide8 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addSpeakerNotes(slide, page);
  addTitle(slide, "我们从高频消费切入，但目标不是小工具市场", "从最容易验证代理价值的场景切入，向更大的 agent commerce 扩展。");

  const steps = [
    { x: 1.0, y: 5.35, w: 1.95, h: 0.74, title: "高频日用品复购" },
    { x: 3.1, y: 4.65, w: 2.05, h: 0.95, title: "家庭采购" },
    { x: 5.3, y: 3.82, w: 2.12, h: 1.12, title: "本地生活" },
    { x: 7.57, y: 2.82, w: 2.18, h: 1.32, title: "企业采购" },
    { x: 9.9, y: 1.58, w: 2.35, h: 1.72, title: "Agent Commerce Network" },
  ];
  steps.forEach((step, index) => {
    addCard(slide, {
      x: step.x,
      y: step.y,
      w: step.w,
      h: step.h,
      fill: index === steps.length - 1 ? COLORS.panelSoft : COLORS.panel,
      lineColor: index === steps.length - 1 ? COLORS.bronze : COLORS.line,
      kicker: index === steps.length - 1 ? "TARGET" : "",
      title: step.title,
      titleSize: step.title.includes("Network") ? 16 : 17,
      titleHeight: 0.46,
      body: "",
    });
  });

  slide.addText("切入顺序不是从市场最大处开始，而是从代理价值最容易被验证、最容易被复用的场景开始。", {
    x: 1.0,
    y: 2.15,
    w: 4.95,
    h: 0.54,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 18,
    bold: true,
    color: COLORS.ivory,
  });
  slide.addText("先拿下一个高频决策入口，再扩展到更多 category、更多 seller、更多协议层。", {
    x: 1.0,
    y: 3.02,
    w: 4.95,
    h: 0.34,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 12,
    color: COLORS.mist,
  });
};

const buildSlide9 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true });
  addSpeakerNotes(slide, page);
  addTitle(slide, "商业模式会从代理价值，走向交易价值", "谁掌握交易执行权，谁就掌握长期商业价值。");

  addCard(slide, {
    x: 0.98,
    y: 2.02,
    w: 3.72,
    h: 4.02,
    fill: COLORS.panel,
    kicker: "EARLY",
    title: "会员订阅\n返佣 / CPS\n高频代理服务",
    titleSize: 20,
    titleHeight: 1.56,
    body: "围绕“帮用户更快完成购买任务”建立早期付费和交易验证。",
    bodySize: 12.5,
  });
  addCard(slide, {
    x: 4.85,
    y: 2.02,
    w: 3.72,
    h: 4.02,
    fill: COLORS.panelSoft,
    kicker: "MID",
    title: "交易分成\nseller 接入\n企业采购 agent 收费",
    titleSize: 20,
    titleHeight: 1.56,
    body: "围绕更深层的代理交易执行权建立平台化收入结构。",
    bodySize: 12.5,
  });
  addCard(slide, {
    x: 8.72,
    y: 2.02,
    w: 3.55,
    h: 4.02,
    fill: COLORS.panel,
    lineColor: COLORS.bronze,
    kicker: "LONG TERM",
    title: "Agent Commerce Infrastructure",
    titleSize: 19,
    titleHeight: 0.86,
    body: "从单点产品走向 buyer-side transaction operating layer。",
    bodySize: 12.5,
  });
};

const buildSlide10 = (page) => {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.ink };
  addBackgroundMotif(slide);
  addPageChrome(slide, page, TOTAL_SLIDES, { dark: true, hideFooter: true });
  addSpeakerNotes(slide, page);

  slide.addText("我们想占据的，不是新的流量位，", {
    x: 0.98,
    y: 1.28,
    w: 8.7,
    h: 0.48,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 27,
    bold: true,
    color: COLORS.white,
  });
  slide.addText("而是主代理背后的交易底座", {
    x: 0.98,
    y: 1.88,
    w: 8.4,
    h: 0.56,
    margin: 0,
    fontFace: FONT_HEAD,
    fontSize: 30,
    bold: true,
    color: COLORS.ivory,
  });

  const nextSteps = [
    {
      x: 0.98,
      title: "真实 seller network",
      body: "替代 seller-sim，进入真实协议接入。",
    },
    {
      x: 4.47,
      title: "前端与 buyer API 打通",
      body: "让购物副驾进入真实代理交易后端。",
    },
    {
      x: 7.96,
      title: "生产级交易底座",
      body: "升级持久化、审计与商业化验证。",
    },
  ];
  nextSteps.forEach((item) => {
    addCard(slide, {
      x: item.x,
      y: 4.1,
      w: 3.1,
      h: 1.72,
      fill: COLORS.panel,
      lineColor: item.title === "生产级交易底座" ? COLORS.bronze : COLORS.line,
      kicker: "NEXT",
      title: item.title,
      titleSize: 15.5,
      body: item.body,
      bodySize: 11.2,
    });
  });

  addPanel(slide, {
    x: 0.98,
    y: 6.34,
    w: 6.7,
    h: 0.68,
    fill: COLORS.bronze,
    fillTransparency: 10,
    lineColor: COLORS.bronze,
    radius: 0.08,
  });
  slide.addText("Claw Native 不是更聪明的导购，而是用户主代理时代的消费交易底座。", {
    x: 1.24,
    y: 6.55,
    w: 6.16,
    h: 0.14,
    margin: 0,
    fontFace: FONT_BODY,
    fontSize: 12.8,
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
