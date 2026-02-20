import { z } from "zod";
import path from "node:path";
import { Command } from "commander";

import { run } from "./utils/exec";
import { resolveFromRoot, resolveOutputPath } from "./utils/paths";

const program = new Command();

program
  .name("analyse")
  .description("Package & bundle analysis, css compatibility and type coverage")
  .option("--dry-run", "Print commands without executing")
  .showHelpAfterError();

const bundleSchema = z.object({
  component: z.enum(["core", "bridge", "client"]).optional(),
  open: z.boolean().optional(),
  outDir: z.string().optional(),
  dryRun: z.boolean().optional(),
});

type BundleArgs = z.infer<typeof bundleSchema>;

const packagesSchema = z.object({
  outDir: z.string().optional(),
  dryRun: z.boolean().optional(),
  component: z.enum(["directory", "audit", "deprecation", "security", "unused", "updates"]).optional(),
});

type PackagesArgs = z.infer<typeof packagesSchema>;

const cssSchema = packagesSchema;
type CssArgs = z.infer<typeof cssSchema>;

const coverageSchema = packagesSchema;
type CoverageArgs = z.infer<typeof coverageSchema>;

const bundle = async (args: BundleArgs): Promise<void> => {
  const component = args.component ?? "core";

  const appDir = resolveFromRoot(
    "apps",
    component === "core" ? "ove-core-ui" : component,
  );

  const outDir = resolveOutputPath(args.outDir, "out/analysis/bundle");

  const output = path.join(outDir, `${component}.html`);

  await run("mkdir", ["-p", outDir], {
    dryRun: args.dryRun,
  });

  await run(
    "pnpx",
    [
      "vite-bundle-visualizer",
      `--open=${args.open ?? false}`,
      `--output=${output}`,
    ],
    {
      cwd: appDir,
      dryRun: args.dryRun,
    },
  );
};

const packages = async (args: PackagesArgs): Promise<void> => {
  const outDir = resolveOutputPath(args.outDir, "out/analysis/packages");
  const auditOutput = path.join(outDir, "audit.json");
  const deprecationDir = resolveFromRoot(
    "tools",
    "deprecation",
  );
  const deprecation = path.join(deprecationDir, "analyze.sh");
  const deprecationOutput = path.join(deprecationDir, "analysis.txt");
  const deprecationOutputDest = path.join(outDir, "deprecated.txt");
  const sandwormOutput = path.join(outDir, "security");
  const packagesJSON = path.join(outDir, "packages.json");
  const updates = path.join(outDir, "updates.txt");


  await run("mkdir", ["-p", args.component === undefined || args.component === "security" ? sandwormOutput : outDir], {
    dryRun: args.dryRun,
  });

  if (args.component === undefined || args.component === "audit") {
    await run("pnpm", ["audit", "--json"], {
      outputFile: auditOutput,
      cwd: resolveFromRoot(),
      dryRun: args.dryRun,
      reject: false,
    });
  }

  if (args.component === undefined || args.component === "deprecation") {
    await run(deprecation, [], {
      cwd: resolveFromRoot(),
      dryRun: args.dryRun,
    });

    await run("cp", [deprecationOutput, deprecationOutputDest], {
      cwd: resolveFromRoot(),
      dryRun: args.dryRun,
    });
  }

  if (args.component === undefined || args.component === "directory") {
    await run("pnpm", ["ls", "--json", "--depth", "5"], {
      outputFile: packagesJSON,
      cwd: resolveFromRoot(),
      dryRun: args.dryRun,
      reject: false,
    });
  }

  if (args.component === undefined || args.component === "updates") {
    await run(
      "pnpm",
      [
        "taze",
        "-l",
        "-r",
        "--ignore-paths",
        "node_modules",
        "major",
        "--sort",
        "time-desc",
      ],
      {
        outputFile: updates,
        cwd: resolveFromRoot(),
        dryRun: args.dryRun,
      },
    );
  }

  if (args.component === undefined || args.component === "security") {
    await run(
      "pnpm",
      [
        "sandworm-audit",
        "--summary",
        "-d",
        "--max-depth=3",
        "-o",
        sandwormOutput,
      ],
      {
        cwd: resolveFromRoot(),
        dryRun: args.dryRun,
      },
    );
  }

  if (args.component === undefined || args.component === "unused") {
    await run(
      "pnpm",
      [
        "--silent",
        "knip",
        "--no-exit-code",
        "--reporter=json",
      ],
      {
        outputFile: path.join(outDir, "unused.json"),
        dryRun: args.dryRun,
        cwd: resolveFromRoot(),
        reject: false,
      },
    );
  }
};

const css = async (args: CssArgs): Promise<void> => {
  const outDir = resolveOutputPath(args.outDir, "out/analysis/css/browser-usage.json");

  const doiuse = resolveFromRoot("tools", "doiuse", "doiuse.ts");

  await run("tsx", [doiuse, outDir], {
    dryRun: args.dryRun,
  });
};

const coverage = async (args: CoverageArgs): Promise<void> => {
  const outDir = resolveOutputPath(args.outDir, "out/coverage/types");

  await run("mkdir", ["-p", outDir], {
    dryRun: args.dryRun,
  });

  await run("pnpx", ["typescript-coverage-report", "-o", outDir], {
    dryRun: args.dryRun,
  });
};

program
  .command("bundle")
  .description("Analyse the web bundle of UI components")
  .option("--component <component>", "core | bridge | client")
  .option("--open", "Open visualizer")
  .option("--out-dir <path>")
  .action(async (opts, cmd) => {
    const parsed = bundleSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await bundle(parsed);
  });

program
  .command("packages")
  .description("Audit dependencies, identify security issues and deprecations")
  .option("--out-dir <path>")
  .option("--component <component>", "directory | audit | deprecation | security | unused | updates")
  .action(async (opts, cmd) => {
    const parsed = packagesSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await packages(parsed);
  });

program
  .command("css")
  .description("Analyse CSS browser compatibility")
  .option("--out-dir <path>")
  .action(async (opts, cmd) => {
    const parsed = cssSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await css(parsed);
  });

program
  .command("coverage")
  .description("Determine TypeScript type coverage")
  .option("--out-dir <path>")
  .action(async (opts, cmd) => {
    const parsed = coverageSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await coverage(parsed);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
