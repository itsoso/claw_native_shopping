import { execFileSync } from "node:child_process";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

export default async function globalSetup(): Promise<void> {
  execFileSync(pnpmCommand, ["--filter", "@claw/browser-extension", "build"], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}
