import { z } from "zod";
import { Command } from "commander";

import { run } from "./utils/exec";
import { resolveFromRoot } from "./utils/paths";

const program = new Command();

program
  .name("db")
  .description("Manage the next-ove database")
  .option("--dry-run", "Print commands without executing")
  .showHelpAfterError();

const resolveSchema = (schemaFile = "schema.prisma"): string => resolveFromRoot("tools", "db", schemaFile);

const prisma = async (args: string[], dryRun?: boolean): Promise<void> => {
  await run("pnpm", ["prisma", ...args], {
    cwd: resolveFromRoot(),
    dryRun,
  });
};

const baseSchema = z.object({
  dryRun: z.boolean().optional(),
});

const simpleCommandSchema = baseSchema;

type SimpleArgs = z.infer<typeof simpleCommandSchema>;

const actionSchema = baseSchema.extend({
  action: z.enum(["add"]),
});

type ActionArgs = z.infer<typeof actionSchema>;

const sync = async (args: SimpleArgs): Promise<void> => {
  await prisma(["generate", "--schema", resolveSchema()], args.dryRun);
};

const push = async (args: SimpleArgs): Promise<void> => {
  await prisma(["db", "push", "--schema", resolveSchema()], args.dryRun);
};

const pull = async (args: SimpleArgs): Promise<void> => {
  await prisma(["db", "pull", "--schema", resolveSchema()], args.dryRun);
};

const show = async (args: SimpleArgs): Promise<void> => {
  await prisma(["studio", "--schema", resolveSchema()], args.dryRun);
};

const user = async (args: ActionArgs): Promise<void> => {
  switch (args.action) {
    case "add": {
      const script = resolveFromRoot("tools", "db", "add-user.ts");

      await run("node", [script], {
        dryRun: args.dryRun,
      });
      return;
    }
  }
};

const service = async (args: ActionArgs): Promise<void> => {
  switch (args.action) {
    case "add": {
      const script = resolveFromRoot("tools", "db", "add-service.ts");

      await run("tsx", [script], {
        dryRun: args.dryRun,
      });
      return;
    }
  }
};

program
  .command("sync")
  .description("Generate type definitions from DB schema")
  .action(async (_, cmd) => {
    const parsed = simpleCommandSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await sync(parsed);
  });

program
  .command("push")
  .description("Push schema changes to the database")
  .action(async (_, cmd) => {
    const parsed = simpleCommandSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await push(parsed);
  });

program
  .command("pull")
  .description("Pull schema changes from the database")
  .action(async (_, cmd) => {
    const parsed = simpleCommandSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await pull(parsed);
  });

program
  .command("show")
  .description("Open database viewer in browser")
  .action(async (_, cmd) => {
    const parsed = simpleCommandSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await show(parsed);
  });

program
  .command("user")
  .description("User management (currently supports: add)")
  .argument("<action>", "add")
  .action(async (action: string, cmd) => {
    const parsed = actionSchema.parse({
      action,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await user(parsed);
  });

program
  .command("service")
  .description("Service management (currently supports: add)")
  .argument("<action>", "add")
  .action(async (action: string, cmd) => {
    const parsed = actionSchema.parse({
      action,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await service(parsed);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
