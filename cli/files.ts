import { Command } from "commander";
import { z } from "zod";
import { run } from "./utils/exec";
import { resolveFromRoot } from "./utils/paths";

const program = new Command();

program
  .name("files")
  .description("File management for the next-ove system")
  .option("--dry-run", "Print commands without executing")
  .showHelpAfterError();

const uploadSchema = z.object({
  dryRun: z.boolean().optional(),
});

type UploadArgs = z.infer<typeof uploadSchema>;

const upload = async (args: UploadArgs): Promise<void> => {
  const scriptPath = resolveFromRoot("tools", "files", "upload.js");

  await run("node", [scriptPath], {
    dryRun: args.dryRun,
  });
};

program
  .command("upload")
  .description("Upload a file to the asset store")
  .action(async (_opts, cmd) => {
    const parsed = uploadSchema.parse({
      dryRun: cmd.parent?.opts().dryRun,
    });

    await upload(parsed);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
