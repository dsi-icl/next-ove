import path from "node:path";
import {
  printSchemas,
  run,
  parseArgs,
  defaultAlias,
  makeSchema,
} from "./utils";
import { z } from "zod";

const tagline = "Development tools for next-ove";
const help =
  'Use "npm run dev [COMMAND] -- --help" for more information about a command';
const descriptions = {
  build: "Build next-ove components for publication",
  deploy: "Deploy next-ove components in production",
  services: "Manage local instances of support services for next-ove",
  patch: "Apply patches to libraries and features",
  tools: "Utilise development tools",
  mock: "Mock components within the system for integration & other testing",
};
const description = "DESCRIPTION\n\tDevelopment tools for next-ove.";

const activePatches = {
  "sandworm-timeout": (args: { timeout: string }) => {
    const src = path.join(
      import.meta.dirname,
      "..",
      "dev",
      "patches",
      "sandworm-timeout.ts",
    );
    const defaults = {
      timeout: 30_000,
    };
    return `tsx ${src} ${args.timeout ?? defaults.timeout}`;
  },
  "nx-electron-commonjs": () =>
    `tsx ${path.join(import.meta.dirname, "..", "dev", "patches", "nx-electron-commonjs.ts")}`,
  "dockerfile-package-versions": () =>
    `tsx ${path.join(import.meta.dirname, "..", "dev", "patches", "dockerfile-package-versions.ts")}`,
};
const supportedTools = {
  "sign-in": () =>
    `tsx ${path.join(import.meta.dirname, "..", "dev", "tools", "generate-token.ts")}`,
  "screen-control": () =>
    `tsx ${path.join(import.meta.dirname, "..", "dev", "tools", "mdc-control.ts")}`,
  "generate-geometry": () =>
    `tsx ${path.join(import.meta.dirname, "..", "dev", "tools", "generate-geometry.ts")}`,
  "generate-system-info": () =>
    `tsx ${path.join(import.meta.dirname, "..", "dev", "testing", "generate-system-info.js")}`,
};

const schemas = {
  build: z.strictObject({
    __cmd__: z.literal("build"),
    component: z.union([
      z.literal("client"),
      z.literal("bridge"),
      z.literal("core"),
    ]),
    arch: z.union([z.literal("x64"), z.literal("arm64")]).optional(),
    platform: z
      .union([
        z.literal("mac"),
        z.literal("linux"),
        z.literal("windows"),
        z.literal("linux/amd64"),
        z.literal("arm64"),
      ])
      .optional(),
    version: z.string().optional(),
  }),
  deploy: z.strictObject({
    __cmd__: z.literal("deploy"),
    component: z.union([
      z.literal("client"),
      z.literal("bridge"),
      z.literal("core"),
    ]),
    version: z.string(),
    target: z.string(),
    screens: z.string().optional(),
    asset: z.string().optional(),
  }),
  services: z.strictObject({
    __cmd__: z.literal("services"),
    action: z.union([
      z.literal("start"),
      z.literal("stop"),
      z.literal("populate"),
    ]),
  }),
  patch: z.strictObject({
    __cmd__: z.literal("patch"),
    name: z
      .string()
      .refine((x) => Object.keys(activePatches).includes(x))
      .optional(),
    timeout: z.coerce.number().optional(),
  }),
  tools: z.strictObject({
    __cmd__: z.literal("tools"),
    name: z.string().refine((x) => Object.keys(supportedTools).includes(x)),
  }),
  mock: z.strictObject({
    __cmd__: z.literal("mock"),
    component: z.union([
      z.literal("bridge"),
      z.literal("renderer"),
      z.literal("logging"),
    ]),
  }),
};

const refinements = {
  build: (x: { component: string; version?: string; arch?: string; platform?: string }) => {
    switch (x.component) {
      case "client":
      case "bridge":
        return (
          x.version === undefined &&
          x.arch !== undefined &&
          (x.platform === undefined ||
            ["mac", "linux", "windows"].includes(x.platform))
        );
      case "core":
        if (x.platform === "linux/amd64") {
          return (
            x.arch === undefined &&
            x.version !== undefined &&
            /\d+\.\d+\.\d+/.test(x.version)
          );
        } else if (x.platform === "linux/arm64") {
          return (
            x.arch === undefined &&
            x.version !== undefined &&
            /\d+\.\d+\.\d+-arm/.test(x.version)
          );
        } else return false;
    }
  },
  deploy: (x: { component: string; screens?: unknown }) =>
    (x.component === "client" && x.screens !== undefined) ||
    x.screens === undefined,
  parse: (x: { name: string; timeout?: number }) => x.name === "sandworm-timeout" || x.timeout !== undefined,
};

const schema = makeSchema(schemas, refinements);

const mock = (args: { component: string; dryRun: boolean; }) => {
  const mock = path.join(
    import.meta.dirname,
    "..",
    "dev",
    "testing",
    `mock-${args.component}.js`,
  );
  run(`tsx ${mock}`, args.dryRun);
};

const build = (args: { platform?: string; component: string; dryRun: boolean; arch?: string; version?: string; }) => {
  const toolDir = path.join(import.meta.dirname, "..", "dev", "deployment", "scripts");
  let platform = "";
  if (args.platform !== undefined) {
    platform = ` --platform=${args.platform}`;
  }
  switch (args.component) {
    case "client":
    case "bridge":
      run(
        `${path.join(toolDir, `build-${args.component}.sh`)} --arch=${args.arch}${platform}`,
        args.dryRun,
      );
      break;
    case "core":
      run(
        `${path.join(toolDir, `build-core.sh`)} --version=${args.version}${platform}`,
        args.dryRun,
      );
      break;
  }
};

const services = (args: { action: string; dryRun: boolean; }) => {
  const composeDir = path.join(import.meta.dirname, "..", "dev", "services");
  const populate = path.join(
    import.meta.dirname,
    "..",
    "dev",
    "cli",
    "auto-populate",
    "auto-populate.ts",
  );
  switch (args.action) {
    case "start":
      run(`cd ${composeDir} && docker compose up -d`, args.dryRun);
      break;
    case "stop":
      run(`cd ${composeDir} && docker compose down`, args.dryRun);
      break;
    case "populate":
      run(`tsx ${populate}`, args.dryRun);
      break;
  }
};

const tools = (args: { name: keyof typeof supportedTools; dryRun: boolean; }) => run(supportedTools[args.name](), args.dryRun);

const patch = (args: { name?: keyof typeof activePatches; dryRun: boolean; }) => {
  if (args.name === undefined) {
    Object.values(activePatches).forEach((x) => run(x(args as unknown as NonNullable<Parameters<typeof x>[0]>), args.dryRun));
    console.log("Patches applied");
  } else {
    run(activePatches[args.name](args as unknown as NonNullable<Parameters<(typeof activePatches)[keyof typeof activePatches]>[0]>), args.dryRun);
    console.log("Patch applied");
  }
};

const deploy = (args: { component: string; asset?: string; screens?: string; version?: string; dryRun: boolean; target?: string; }) => {
  let asset = "";
  let screens = undefined;
  let script = path.join(
    import.meta.dirname,
    "..",
    "dev",
    "deployment",
    "scripts",
    `deploy-${args.component}.sh`,
  );
  if (args.asset !== undefined) {
    asset = ` --asset=${args.asset}`;
  }
  if (args.screens !== undefined) {
    screens = args.screens
      .split(",")
      .map((screen, i) => ` --screen${i + 1}=${screen}`);
  }

  run(
    `${script} --version=${args.version} --target=${args.target}${screens ?? ""}${asset}`,
    args.dryRun,
  );
};

const runDev = (args: { __cmd__: string; }) => {
  switch (args.__cmd__) {
    case "mock":
      mock(args as unknown as NonNullable<Parameters<typeof mock>>[0]);
      break;
    case "build":
      build(args as unknown as NonNullable<Parameters<typeof build>>[0]);
      break;
    case "services":
      services(args as unknown as NonNullable<Parameters<typeof services>>[0]);
      break;
    case "tools":
      tools(args as unknown as NonNullable<Parameters<typeof tools>>[0]);
      break;
    case "patch":
      patch(args as unknown as NonNullable<Parameters<typeof patch>>[0]);
      break;
    case "deploy":
      deploy(args as unknown as NonNullable<Parameters<typeof deploy>>[0]);
      break;
    default:
      throw new Error("Unknown command");
  }
};

const args = parseArgs(schema, true, defaultAlias, {
  build: ["component"],
  deploy: ["component", "version", "target"],
  services: ["action"],
  mock: ["component"],
  tools: ["name"],
  patch: ["name"],
});

if (args.__cmd__ === undefined && args.help) {
  printSchemas(schemas, tagline, description, descriptions, help);
} else if (args.help) {
  printSchemas(schemas, tagline, description, descriptions, help, args.__cmd__);
} else {
  runDev(args);
}
