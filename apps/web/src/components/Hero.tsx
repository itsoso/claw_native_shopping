import React from "react";

interface HeroProps {
  onStart: () => void;
  runtime: "demo" | "live";
}

export function Hero({ onStart, runtime }: HeroProps): React.ReactElement {
  return (
    <section className="hero">
      <h1>OpenClaw does not help users browse — it acts for them.</h1>
      <p className="hero-sub">
        全栈闭环演示台；当前运行模式：
        <strong>{runtime === "demo" ? "确定性演示" : "实时（本地服务）"}</strong>
      </p>
      <button type="button" className="primary" onClick={onStart}>
        开始演示
      </button>
    </section>
  );
}
