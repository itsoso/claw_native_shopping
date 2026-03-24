import type { CSSProperties } from "react";

import type { DecisionMode } from "../types/preferences.js";

type PreferenceModeOption = {
  mode: DecisionMode;
  label: string;
};

type PreferenceModeProps = {
  value: DecisionMode;
  onChange: (mode: DecisionMode) => void;
};

const OPTIONS: PreferenceModeOption[] = [
  { mode: "time_saving", label: "更省时间" },
  { mode: "safe", label: "更稳妥" },
  { mode: "value", label: "更划算" },
];

const groupStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "8px",
  marginBottom: "14px",
};

const baseButtonStyle: CSSProperties = {
  appearance: "none",
  borderRadius: "999px",
  border: "1px solid rgba(82, 54, 14, 0.16)",
  padding: "8px 10px",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.1,
  cursor: "pointer",
  transition:
    "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",
};

const selectedStyle: CSSProperties = {
  background: "#3f2a14",
  color: "#fffdf8",
  boxShadow: "0 8px 20px rgba(63, 42, 20, 0.18)",
};

const unselectedStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  color: "#5c4a38",
};

export function PreferenceMode({ value, onChange }: PreferenceModeProps) {
  return (
    <div aria-label="决策模式" role="group" style={groupStyle}>
      {OPTIONS.map((option) => {
        const selected = option.mode === value;

        return (
          <button
            key={option.mode}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.mode)}
            style={{
              ...baseButtonStyle,
              ...(selected ? selectedStyle : unselectedStyle),
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
