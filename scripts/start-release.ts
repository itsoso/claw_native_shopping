import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RELEASE_WEB_PORT = 4174;
export const RELEASE_API_PORT = 4300;
export const RELEASE_SELLER_PORT = 4301;
export const RELEASE_WEB_PORT_ENV = "OPENCLAW_RELEASE_WEB_PORT";
export const RELEASE_API_PORT_ENV = "OPENCLAW_RELEASE_API_PORT";
export const RELEASE_SELLER_PORT_ENV = "OPENCLAW_RELEASE_SELLER_PORT";

export type ReleaseMode = "preview" | "dev";

export type ReleaseServiceSpec = {
  name: "api" | "seller-sim" | "web";
  command: string;
  args: string[];
  env: Record<string, string>;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const parsePort = (rawValue: string | undefined, fallback: number): number => {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const resolveReleasePorts = (env: NodeJS.ProcessEnv = process.env) => ({
  webPort: parsePort(env[RELEASE_WEB_PORT_ENV], RELEASE_WEB_PORT),
  apiPort: parsePort(env[RELEASE_API_PORT_ENV], RELEASE_API_PORT),
  sellerPort: parsePort(env[RELEASE_SELLER_PORT_ENV], RELEASE_SELLER_PORT),
});

const createWebService = (
  mode: ReleaseMode,
  ports: ReturnType<typeof resolveReleasePorts>,
): ReleaseServiceSpec => {
  const baseArgs =
    mode === "dev"
      ? ["--dir", "apps/web", "dev"]
      : ["--dir", "apps/web", "exec", "vite", "preview"];

  return {
    name: "web",
    command: pnpmCommand,
    args: [
      ...baseArgs,
      "--host",
      "0.0.0.0",
      "--port",
      String(ports.webPort),
      "--strictPort",
    ],
    env: {
      OPENCLAW_LIVE_API_TARGET: `http://127.0.0.1:${ports.apiPort}`,
      OPENCLAW_LIVE_SELLER_TARGET: `http://127.0.0.1:${ports.sellerPort}`,
    },
  };
};

export const createReleaseServiceSpecs = (
  mode: ReleaseMode = "preview",
): ReleaseServiceSpec[] => {
  const ports = resolveReleasePorts();

  return [
    {
      name: "api",
      command: pnpmCommand,
      args: ["start:api"],
      env: {
        HOST: "127.0.0.1",
        PORT: String(ports.apiPort),
        SELLER_SIM_BASE_URL: `http://127.0.0.1:${ports.sellerPort}`,
      },
    },
    {
      name: "seller-sim",
      command: pnpmCommand,
      args: ["start:seller-sim"],
      env: {
        HOST: "127.0.0.1",
        PORT: String(ports.sellerPort),
      },
    },
    createWebService(mode, ports),
  ];
};

export const parseReleaseMode = (argv: readonly string[] = process.argv.slice(2)): ReleaseMode => {
  const modeArg = argv.find((value) => value.startsWith("--mode="));
  const mode = modeArg?.split("=", 2)[1] ?? "preview";

  if (mode !== "preview" && mode !== "dev") {
    throw new Error(`unsupported_release_mode:${mode}`);
  }

  return mode;
};

const pipeOutput = (
  stream: NodeJS.ReadableStream | null,
  prefix: string,
  writer: (line: string) => void,
): void => {
  if (!stream) {
    return;
  }

  stream.on("data", (chunk: Buffer | string) => {
    const text = chunk.toString();
    const normalized = text.endsWith("\n") ? text.slice(0, -1) : text;

    for (const line of normalized.split("\n")) {
      writer(`${prefix}${line}\n`);
    }
  });
};

const runBuildStep = (): void => {
  execFileSync(pnpmCommand, ["build:web"], {
    cwd: rootDir,
    stdio: "inherit",
  });
};

const startServices = (mode: ReleaseMode): void => {
  const children: ChildProcess[] = [];
  const specs = createReleaseServiceSpecs(mode);
  const ports = resolveReleasePorts();
  let shuttingDown = false;

  const shutdown = (exitCode = 0): void => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
    }

    setTimeout(() => {
      for (const child of children) {
        if (!child.killed) {
          child.kill("SIGKILL");
        }
      }
      process.exit(exitCode);
    }, 500).unref();
  };

  for (const spec of specs) {
    const child = spawn(spec.command, spec.args, {
      cwd: rootDir,
      env: {
        ...process.env,
        ...spec.env,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    pipeOutput(child.stdout, `[${spec.name}] `, (line) => process.stdout.write(line));
    pipeOutput(child.stderr, `[${spec.name}] `, (line) => process.stderr.write(line));

    child.on("exit", (code, signal) => {
      if (shuttingDown) {
        return;
      }

      if (code === 0 || signal === "SIGTERM") {
        shutdown(0);
        return;
      }

      process.stderr.write(
        `[release] ${spec.name} exited unexpectedly with ${
          signal ? `signal ${signal}` : `code ${code ?? "unknown"}`
        }\n`,
      );
      shutdown(1);
    });

    children.push(child);
  }

  process.stdout.write(
    `[release] stack ready in ${mode} mode\n` +
      `[release] web http://localhost:${ports.webPort}\n` +
      `[release] api http://127.0.0.1:${ports.apiPort}\n` +
      `[release] seller http://127.0.0.1:${ports.sellerPort}\n`,
  );

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));
};

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const mode = parseReleaseMode();

  if (mode === "preview") {
    runBuildStep();
  }

  startServices(mode);
}
