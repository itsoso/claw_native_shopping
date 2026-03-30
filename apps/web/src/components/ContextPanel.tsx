import type { ScenarioContextItem } from "../runtime/types.js";

type ContextPanelProps = {
  eyebrow: string;
  title: string;
  hint: string;
  items: readonly ScenarioContextItem[];
};

export function ContextPanel({ eyebrow, hint, items, title }: ContextPanelProps) {
  return (
    <section className="panel context-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <p className="panel__hint">{hint}</p>
      </div>

      <div className="context-panel__list">
        {items.map((item) => (
          <article className="context-card" key={`${item.label}-${item.value}`}>
            <span className="context-card__label">{item.label}</span>
            <strong>{item.value}</strong>
            {item.note ? <p>{item.note}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
