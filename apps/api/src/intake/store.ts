import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

type IntakeKind = "feedback" | "interest";

export type IntakeStore = {
  append(kind: IntakeKind, payload: Record<string, unknown>): Promise<void>;
};

export type IntakeStoreOptions = {
  dataDir: string;
};

const resolveFilePath = (dataDir: string, kind: IntakeKind): string =>
  join(dataDir, `${kind}.jsonl`);

export const createIntakeStore = (
  options: IntakeStoreOptions,
): IntakeStore => ({
  async append(kind, payload) {
    const filePath = resolveFilePath(options.dataDir, kind);
    await mkdir(dirname(filePath), { recursive: true });
    await appendFile(
      filePath,
      `${JSON.stringify({ recordedAt: new Date().toISOString(), ...payload })}\n`,
      "utf8",
    );
  },
});
