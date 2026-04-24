import { storage } from "wxt/utils/storage";

import { inferDefaultMode } from "../recommendation/inferDefaultMode.js";
import type { DecisionMode, DecisionPreferences } from "../types/preferences.js";
import { readSavingsRecords } from "./savingsRecords.js";
import { readViewedProducts } from "./viewedProducts.js";

const DECISION_MODE_STORAGE_KEY = "local:decision-mode";
const DEFAULT_DECISION_MODE: DecisionMode = "time_saving";

export type EffectiveMode = {
  mode: DecisionMode;
  auto: boolean;
  autoReason: string | null;
};

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

export async function getEffectiveMode(): Promise<EffectiveMode> {
  const stored = await storage.getItem<DecisionMode>(DECISION_MODE_STORAGE_KEY);
  if (stored) {
    return { mode: stored, auto: false, autoReason: null };
  }

  const [viewedProducts, savingsRecords] = await Promise.all([
    readViewedProducts(),
    readSavingsRecords(),
  ]);
  const inferred = inferDefaultMode({ viewedProducts, savingsRecords });
  return { mode: inferred.mode, auto: true, autoReason: inferred.reason };
}
