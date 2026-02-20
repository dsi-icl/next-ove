import { z } from "zod";
import { Command } from "commander";

import { run } from "./utils/exec";
import { resolveFromRoot } from "./utils/paths";

const program = new Command();

program
  .name("dev")
  .description("Development tools for next-ove")
  .option("--dry-run", "Print commands without executing")
  .showHelpAfterError();

const activePatches = {
  "sandworm-timeout": {
    schema: z.object({
      timeout: z.number().optional(),
    }),
    run: async (args: { timeout?: number }, dryRun?: boolean) => {
      const src = resolveFromRoot("dev", "patches", "sandworm-timeout.ts");

      const timeout = args.timeout ?? 30_000;

      await run("tsx", [src, String(timeout)], { dryRun });
    },
  },

  "nx-electron-commonjs": {
    schema: z.object({}),
    run: async (_: {}, dryRun?: boolean) => {
      const src = resolveFromRoot("dev", "patches", "nx-electron-commonjs.ts");

      await run("tsx", [src], { dryRun });
    },
  },

  "dockerfile-package-versions": {
    schema: z.object({}),
    run: async (_: {}, dryRun?: boolean) => {
      const src = resolveFromRoot(
        "dev",
        "patches",
        "dockerfile-package-versions.ts",
      );

      await run("tsx", [src], { dryRun });
    },
  },
} as const;

type PatchName = keyof typeof activePatches;

const supportedTools = {
  "sign-in": resolveFromRoot("dev", "tools", "generate-token.ts"),
  "screen-control": resolveFromRoot("dev", "tools", "mdc-control.ts"),
  "generate-geometry": resolveFromRoot("dev", "tools", "generate-geometry.ts"),
  "generate-system-info": resolveFromRoot(
    "dev",
    "testing",
    "generate-system-info.js",
  ),
} as const;

type ToolName = keyof typeof supportedTools;

const baseSchema = z.object({
  dryRun: z.boolean().optional(),
});

const servicesSchema = baseSchema.extend({
  action: z.enum(["start", "stop", "populate"]),
});

const toolsSchema = baseSchema.extend({
  name: z.enum(Object.keys(supportedTools) as [ToolName, ...ToolName[]]),
});

const mockSchema = baseSchema.extend({
  component: z.enum(["bridge", "logging"]),
  extraArguments: z.string().optional(),
});

const patchSchema = baseSchema.extend({
  name: z
    .enum(Object.keys(activePatches) as [PatchName, ...PatchName[]])
    .optional(),
  timeout: z.coerce.number().optional(),
});

const services = async (args: z.infer<typeof servicesSchema>): Promise<void> => {
  const composeDir = resolveFromRoot("dev", "services");

  const populateScript = resolveFromRoot(
    "dev",
    "cli",
    "auto-populate",
    "auto-populate.ts",
  );

  switch (args.action) {
    case "start":
      await run("docker", ["compose", "up", "-d"], {
        cwd: composeDir,
        dryRun: args.dryRun,
      });
      return;

    case "stop":
      await run("docker", ["compose", "down"], {
        cwd: composeDir,
        dryRun: args.dryRun,
      });
      return;

    case "populate":
      await run("tsx", [populateScript], { dryRun: args.dryRun });
      return;
  }
};

const mock = async (args: z.infer<typeof mockSchema>): Promise<void> => {
  const script = resolveFromRoot("dev", "testing", `mock-${args.component}.js`);

  const extra = args.extraArguments ? args.extraArguments.split(" ") : [];

  await run("tsx", [script, ...extra], { dryRun: args.dryRun });
};

const tools = async (args: z.infer<typeof toolsSchema>): Promise<void> => {
  const script = supportedTools[args.name];

  await run("tsx", [script], { dryRun: args.dryRun });
};

const patch = async (args: z.infer<typeof patchSchema>): Promise<void> => {
  if (!args.name) {
    for (const name of Object.keys(activePatches) as PatchName[]) {
      const entry = activePatches[name];

      const parsed = entry.schema.parse(args);
      await entry.run(parsed, args.dryRun);
    }

    console.log("Patches applied");
    return;
  }

  const entry = activePatches[args.name];
  const parsed = entry.schema.parse(args);

  await entry.run(parsed, args.dryRun);

  console.log("Patch applied");
};

program
  .command("services")
  .description("Manage local instances of support services")
  .argument("<action>", "start | stop | populate")
  .action(async (action: string, cmd) => {
    const parsed = servicesSchema.parse({
      action,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await services(parsed);
  });

program
  .command("mock")
  .description("Mock components within the system")
  .argument("<component>", "bridge | logging")
  .option("--extra-arguments <args>")
  .action(async (component, opts, cmd) => {
    const parsed = mockSchema.parse({
      component,
      extraArguments: opts.extraArguments,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await mock(parsed);
  });

program
  .command("tools")
  .description("Utilise development tools")
  .argument("<name>")
  .action(async (name: string, cmd) => {
    const parsed = toolsSchema.parse({
      name,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await tools(parsed);
  });

program
  .command("patch")
  .description("Apply patches to libraries and features")
  .option("--name <name>")
  .option("--timeout <ms>")
  .action(async (opts, cmd) => {
    const parsed = patchSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await patch(parsed);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
