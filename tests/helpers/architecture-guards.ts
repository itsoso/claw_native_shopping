import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const sourceRoots = [join(repoRoot, "apps"), join(repoRoot, "packages")];

const collectSourceFiles = (root: string): string[] => {
  const entries = readdirSync(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(path));
      continue;
    }

    if (entry.isFile() && path.endsWith(".ts")) {
      files.push(path);
    }
  }

  return files;
};

const readSourceFiles = (): string[] => sourceRoots.flatMap(collectSourceFiles);

export const findPaymentPortImportViolations = (): string[] =>
  readSourceFiles().filter((filePath) => {
    if (filePath.includes(join(repoRoot, "packages", "checkout"))) {
      return false;
    }

    return readFileSync(filePath, "utf8").includes("packages/checkout/src/ports.js");
  });

export const findOrderStateMutationViolations = (): string[] =>
  readSourceFiles().filter(
    (filePath) =>
      !filePath.endsWith(join("packages", "orchestrator", "src", "service.ts")) &&
      !filePath.endsWith(join("packages", "memory", "src", "store.ts")) &&
      readFileSync(filePath, "utf8").includes("setOrderSnapshot(")
  );

export const serviceEmitsCommittedOrderAuditEvent = (): boolean =>
  (() => {
    const serviceSource = readFileSync(
      join(repoRoot, "packages", "orchestrator", "src", "service.ts"),
      "utf8"
    );

    return (
      serviceSource.includes('appendAuditEvent(orderId') &&
      serviceSource.includes('type: "ORDER_COMMITTED"')
    );
  })();
