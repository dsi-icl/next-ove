import { z } from "zod";
import { Command } from "commander";

import { run } from "./utils/exec";
import { resolveFromRoot } from "./utils/paths";

const program = new Command();

program
  .name("security")
  .description("Security tools for next-ove")
  .option("--dry-run", "Print commands without executing")
  .showHelpAfterError();

const baseSchema = z.object({
  dryRun: z.boolean().optional(),
});

const lockVersionsSchema = baseSchema;
type LockVersionsArgs = z.infer<typeof lockVersionsSchema>;

const checkCompromisedSchema = baseSchema;
type CheckCompromisedArgs = z.infer<typeof checkCompromisedSchema>;

const lockVersions = async (args: LockVersionsArgs): Promise<void> => {
  const toolDir = resolveFromRoot("tools", "security", "lock-versions");

  await run("./lock-versions.sh", [], {
    cwd: toolDir,
    dryRun: args.dryRun,
  });
};

const checkCompromised = async (args: CheckCompromisedArgs): Promise<void> => {
  const toolDir = resolveFromRoot("tools", "security", "check-compromised");

  await run("./check-compromised.sh", [], {
    cwd: toolDir,
    dryRun: args.dryRun,
  });
};

program
  .command("lock-versions")
  .description("Lock dependency versions to those currently installed")
  .action(async (_, cmd) => {
    const parsed = lockVersionsSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await lockVersions(parsed);
  });

program
  .command("check-compromised")
  .description("Check for known vulnerabilities in dependencies")
  .action(async (_, cmd) => {
    const parsed = checkCompromisedSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await checkCompromised(parsed);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
