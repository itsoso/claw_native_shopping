import React from "react";
import type { ScenarioPresentation } from "../lib/types.js";

type InventoryPressurePanelProps = {
  scenario: ScenarioPresentation;
};

export const InventoryPressurePanel = ({
  scenario
}: InventoryPressurePanelProps): React.JSX.Element => {
  return (
    <section className="surface-card inventory-panel">
      <div className="section-header">
        <p className="section-kicker">Pressure</p>
        <h2>库存压力</h2>
      </div>
      <p className="section-copy">{scenario.policySummary}</p>
      <div className="inventory-grid">
        {scenario.inventoryCards.map((card) => (
          <article className="inventory-card" key={card.name}>
            <div className="inventory-card-head">
              <h3>{card.name}</h3>
              <p>
                {card.onHand} / {card.reorderPoint}
              </p>
            </div>
            <p className="inventory-card-note">{card.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
