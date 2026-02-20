import { execa } from "execa";

export type ExecOptions = {
  cwd?: string;
  dryRun?: boolean;
  outputFile?: string;
  append?: boolean;
  reject?: boolean;
}

export const run = async (
  command: string,
  args: string[] = [],
  options: ExecOptions = {},
): Promise<void> => {
  const { cwd, dryRun, outputFile, append, reject } = options;

  if (dryRun) {
    console.log(
      ["$ ", command, ...args].join(" "),
      cwd ? `(cwd: ${cwd})` : "",
      outputFile ? `> ${outputFile}` : "",
    );
    return;
  }

  if (!outputFile) {
    await execa(command, args, {
      cwd,
      stdio: "inherit",
      reject: reject === undefined ? true : reject,
    });
    return;
  }

  await execa(command, args, {
    cwd,
    stdout: [{ file: outputFile, append: Boolean(append) }],
    stderr: "inherit",
    reject: reject === undefined ? true : reject,
  });
};
