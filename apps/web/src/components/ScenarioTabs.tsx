import React from "react";
import { scenarioList } from "../lib/scenarios.js";
import type { ScenarioId } from "../lib/types.js";

type ScenarioTabsProps = {
  selectedScenario: ScenarioId;
  onSelectScenario: (scenarioId: ScenarioId) => void;
};

export const ScenarioTabs = ({
  selectedScenario,
  onSelectScenario
}: ScenarioTabsProps): React.JSX.Element => {
  return (
    <div aria-label="Scenario switcher" className="scenario-tabs" role="tablist">
      {scenarioList.map((scenario) => (
        <button
          key={scenario.id}
          aria-selected={selectedScenario === scenario.id}
          className="scenario-tab"
          onClick={() => {
            onSelectScenario(scenario.id);
          }}
          role="tab"
          type="button"
        >
          {scenario.tabLabel}
        </button>
      ))}
    </div>
  );
};
