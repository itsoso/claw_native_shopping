import React from "react";
import type { ScenarioDefinition } from "../runtime/types.js";

interface ScenarioPickerProps {
  scenarios: ScenarioDefinition[];
  selected: string;
  onSelect: (id: string) => void;
}

export function ScenarioPicker({
  scenarios,
  selected,
  onSelect,
}: ScenarioPickerProps): React.ReactElement {
  return (
    <section className="scenario-picker">
      <h2>场景</h2>
      <ul>
        {scenarios.map((scenario) => (
          <li key={scenario.id}>
            <button
              type="button"
              aria-pressed={selected === scenario.id}
              className={selected === scenario.id ? "scenario selected" : "scenario"}
              onClick={() => onSelect(scenario.id)}
            >
              <strong>{scenario.label}</strong>
              <span>{scenario.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
