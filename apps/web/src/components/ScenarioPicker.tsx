import type { ScenarioDefinition, ScenarioId, ScenarioMode } from "../runtime/types.js";

type ScenarioPickerProps = {
  mode: ScenarioMode;
  onModeChange: (mode: ScenarioMode) => void;
  onSelectScenario: (scenarioId: ScenarioId) => void;
  scenarios: readonly ScenarioDefinition[];
  selectedScenarioId: ScenarioId;
};

const modeCopy: Record<ScenarioMode, string> = {
  time_saving: "更省时间",
  safe: "更稳妥",
  value: "更划算",
};

export function ScenarioPicker({
  mode,
  onModeChange,
  onSelectScenario,
  scenarios,
  selectedScenarioId,
}: ScenarioPickerProps) {
  return (
    <section className="panel scenario-picker">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Scenario Picker</p>
          <h2>先选一个可讲、可跑、可解释的场景。</h2>
        </div>

        <div className="mode-rail" aria-label="decision mode selector">
          {(["time_saving", "safe", "value"] as const).map((candidate) => (
            <button
              className="mode-chip"
              data-active={mode === candidate}
              aria-pressed={mode === candidate}
              key={candidate}
              type="button"
              onClick={() => onModeChange(candidate)}
            >
              {modeCopy[candidate]}
            </button>
          ))}
        </div>
      </div>

      <div className="scenario-grid">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === selectedScenarioId;

          return (
            <button
              className="scenario-card"
              data-active={isActive}
              aria-pressed={isActive}
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario.id)}
            >
              <div className="scenario-card__top">
                <span className="scenario-card__badge">{isActive ? "Selected" : "Preset"}</span>
                <span className="scenario-card__id">{scenario.id}</span>
              </div>

              <h3>{scenario.title}</h3>
              <p>{scenario.summary}</p>

              <div className="tag-list">
                {scenario.tags.map((tag) => (
                  <span className="tag tag--soft" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
