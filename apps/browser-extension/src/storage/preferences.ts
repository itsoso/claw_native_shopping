import { storage } from "wxt/utils/storage";

import type { DecisionMode, DecisionPreferences } from "../types/preferences.js";

const DECISION_MODE_STORAGE_KEY = "local:decision-mode";
const DEFAULT_DECISION_MODE: DecisionMode = "time_saving";

export async function loadPreferences(): Promise<DecisionPreferences> {
  const mode = await storage.getItem<DecisionMode>(DECISION_MODE_STORAGE_KEY, {
    fallback: DEFAULT_DECISION_MODE,
  });

  return { mode };
}

export async function savePreferences(
  preferences: DecisionPreferences,
): Promise<void> {
  await storage.setItem(DECISION_MODE_STORAGE_KEY, preferences.mode);
}
