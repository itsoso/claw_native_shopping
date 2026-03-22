import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type SourceFile = {
  relativePath: string;
  text: string;
};

const repoRoot = process.cwd();
const sourceRoots = ["apps", "packages"];
const ignoredDirectoryNames = new Set([
  "node_modules",
  "dist",
  "coverage",
  ".turbo",
  ".worktrees",
  "worktrees",
  "docs",
  "tests",
  "scripts"
]);

const checkoutPortLeakPattern = /\bCheckout(?:PaymentPort|SellerPort|ExecuteCheckoutInput)\b/;
const checkoutPortImportPattern = /from\s+["'][^"']*checkout\/src\/ports(?:\.js)?["']/;
const orderSnapshotCallPattern = /\.setOrderSnapshot\s*\(/;
const committedOrderSnapshotPattern = /setOrderSnapshot\s*\([\s\S]*?(?:status:\s*(?:result\.status|["']orderCommitted["']))/m;
const committedOrderAuditPattern = /ORDER_COMMITTED/;

async function collectSourceFiles(): Promise<SourceFile[]> {
  const files: SourceFile[] = [];

  for (const root of sourceRoots) {
    const absoluteRoot = path.join(repoRoot, root);
    await collectSourceFilesFromDirectory(absoluteRoot, root, files);
  }

  return files;
}

async function collectSourceFilesFromDirectory(
  absoluteDir: string,
  relativeDir: string,
  files: SourceFile[]
): Promise<void> {
  const entries = await readdir(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredDirectoryNames.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(absoluteDir, entry.name);
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      await collectSourceFilesFromDirectory(absolutePath, relativePath, files);
      continue;
    }

    if (!entry.isFile() || !relativePath.endsWith(".ts")) {
      continue;
    }

    const text = await readFile(absolutePath, "utf8");
    files.push({
      relativePath: relativePath.split(path.sep).join("/"),
      text
    });
  }
}

export const findPaymentPortLeaks = async (): Promise<string[]> => {
  const files = await collectSourceFiles();
  const leaks: string[] = [];

  for (const file of files) {
    if (file.relativePath.startsWith("packages/checkout/")) {
      continue;
    }

    if (checkoutPortLeakPattern.test(file.text) || checkoutPortImportPattern.test(file.text)) {
      leaks.push(file.relativePath);
    }
  }

  return leaks;
};

export const findOrderStateWriterViolations = async (): Promise<string[]> => {
  const files = await collectSourceFiles();
  const violations: string[] = [];
  const allowedWriters = new Set([
    "packages/orchestrator/src/service.ts",
    "apps/api/src/server.ts"
  ]);

  for (const file of files) {
    if (!orderSnapshotCallPattern.test(file.text)) {
      continue;
    }

    if (allowedWriters.has(file.relativePath)) {
      continue;
    }

    violations.push(file.relativePath);
  }

  return violations;
};

export const findCommittedOrderAuditViolations = async (): Promise<string[]> => {
  const files = await collectSourceFiles();
  const violations: string[] = [];

  for (const file of files) {
    if (file.relativePath === "apps/api/src/server.ts" && file.text.includes("SEED_ORDER")) {
      continue;
    }

    if (committedOrderSnapshotPattern.test(file.text) && !committedOrderAuditPattern.test(file.text)) {
      violations.push(file.relativePath);
    }
  }

  return violations;
};
