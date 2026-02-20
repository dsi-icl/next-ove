import { z } from "zod";
import { Command } from "commander";

import { run } from "./utils/exec";

const program = new Command();

program
  .name("test")
  .description("Run unit and integration tests on the next-ove system")
  .option("--dry-run", "Print commands without executing")
  .showHelpAfterError();

const baseSchema = z.object({
  dryRun: z.boolean().optional(),
});

const unitSchema = baseSchema.extend({});
type UnitArgs = z.infer<typeof unitSchema>;

const integrationSchema = baseSchema.extend({});
type IntegrationArgs = z.infer<typeof integrationSchema>;

async function unit(args: UnitArgs): Promise<void> {
  await run("pnx", ["run-many", "--target=test", "--", "--coverage"], {
    dryRun: args.dryRun,
  });
}

const integration = async (args: IntegrationArgs): Promise<void> => {
  await run(
    "pnpx",
    ["jest", "--coverage", "--config", "jest.integration.config.ts"],
    { dryRun: args.dryRun },
  );
};

program
  .command("unit")
  .description("Run unit tests")
  .action(async (_, cmd) => {
    const parsed = unitSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await unit(parsed);
  });

program
  .command("integration")
  .description("Run integration tests")
  .action(async (_, cmd) => {
    const parsed = integrationSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await integration(parsed);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
