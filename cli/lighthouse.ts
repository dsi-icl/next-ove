// noinspection RequiredAttributes

import { Command } from "commander";
import { z } from "zod";
import { run } from "./utils/exec";
import { resolveFromRoot, resolveOutputPath } from "./utils/paths";

const program = new Command();

program
  .name("lighthouse")
  .description("Generates Lighthouse scores for the next-ove UIs")
  .option("--dry-run", "Print commands without executing")
  .showHelpAfterError();

const auditSchema = z.object({
  config: z.string().optional(),
  outDir: z.string().optional(),
  dryRun: z.boolean().optional(),
});

type AuditArgs = z.infer<typeof auditSchema>;

const wizardSchema = z.object({
  dryRun: z.boolean().optional(),
});

type WizardArgs = z.infer<typeof wizardSchema>;

const serverSchema = z.object({
  config: z.string().optional(),
  port: z.coerce.number().optional(),
  storageMethod: z.string().optional(),
  sqlDialect: z.string().optional(),
  sqlDatabasePath: z.string().optional(),
  dryRun: z.boolean().optional(),
});

type ServerArgs = z.infer<typeof serverSchema>;

const audit = async (args: AuditArgs): Promise<void> => {
  const lighthouseScript = resolveFromRoot("tools", "lighthouseci", "audit.js");

  const config = resolveOutputPath(
    args.config,
    "tools/lighthouseci/config.json",
  );

  const outDir = resolveOutputPath(args.outDir, "out/lighthouse");

  await run("mkdir", ["-p", outDir], {
    dryRun: args.dryRun,
  });

  await run("node", [lighthouseScript, config], {
    dryRun: args.dryRun,
  });
};

const wizard = async (args: WizardArgs): Promise<void> => {
  await run("npx", ["lhci", "wizard"], {
    dryRun: args.dryRun,
  });
};

const server = async (args: ServerArgs): Promise<void> => {
  const config = resolveOutputPath(
    args.config,
    "tools/lighthouseci/lighthouserc.json",
  );

  const port = args.port ?? 9002;
  const storageMethod = args.storageMethod ?? "sql";
  const sqlDialect = args.sqlDialect ?? "sqlite";

  const sqlDatabasePath = resolveOutputPath(
    args.sqlDatabasePath,
    "tools/lighthouseci/db.sql",
  );

  await run(
    "npx",
    [
      "lhci",
      "server",
      `--config=${config}`,
      `--port=${port}`,
      `--storage.storageMethod=${storageMethod}`,
      `--storage.sqlDialect=${sqlDialect}`,
      `--storage.sqlDatabasePath=${sqlDatabasePath}`,
    ],
    { dryRun: args.dryRun },
  );
};

program
  .command("audit")
  .description("Generate Lighthouse scores for UI components")
  .option("--config <path>")
  .option("--out-dir <path>")
  .action(async (opts, cmd) => {
    const parsed = auditSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await audit(parsed);
  });

program
  .command("wizard")
  .description("Run Lighthouse wizard")
  .action(async (_, cmd) => {
    const parsed = wizardSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await wizard(parsed);
  });

program
  .command("server")
  .description("Run Lighthouse server")
  .option("--config <path>")
  .option("--port <number>")
  .option("--storage-method <method>")
  .option("--sql-dialect <dialect>")
  .option("--sql-database-path <path>")
  .action(async (opts, cmd) => {
    const parsed = serverSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await server(parsed);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
