import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

type IntakeKind = "feedback" | "interest";
type FeedbackEntry = {
  recordedAt: string;
  scenarioId: string;
  rating: number;
  message: string;
};

type InterestEntry = {
  recordedAt: string;
  email: string;
  source: string;
};

export type IntakeSummary = {
  feedbackCount: number;
  interestCount: number;
  recentFeedback: Array<{
    scenarioId: string;
    message: string;
    recordedAt: string;
  }>;
};

export type IntakeStore = {
  append(kind: IntakeKind, payload: Record<string, unknown>): Promise<void>;
  readSummary(): Promise<IntakeSummary>;
};

export type IntakeStoreOptions = {
  dataDir: string;
};

const resolveFilePath = (dataDir: string, kind: IntakeKind): string =>
  join(dataDir, `${kind}.jsonl`);

const readEntries = async <T>(filePath: string): Promise<T[]> => {
  try {
    const content = await readFile(filePath, "utf8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as T);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
};

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
  async readSummary() {
    const [feedbackEntries, interestEntries] = await Promise.all([
      readEntries<FeedbackEntry>(resolveFilePath(options.dataDir, "feedback")),
      readEntries<InterestEntry>(resolveFilePath(options.dataDir, "interest")),
    ]);

    return {
      feedbackCount: feedbackEntries.length,
      interestCount: interestEntries.length,
      recentFeedback: feedbackEntries.slice(-3).reverse().map((entry) => ({
        scenarioId: entry.scenarioId,
        message: entry.message,
        recordedAt: entry.recordedAt,
      })),
    };
  },
});
