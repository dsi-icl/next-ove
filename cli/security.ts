import path from "node:path";
import {
  defaultAlias,
  makeSchema,
  parseArgs,
  printSchemas,
  run,
} from "./utils";
import { z } from "zod";

const tagline = "Security tools for next-ove";
const help =
  'Use "npm run security [COMMAND] -- --help" for more information about a command';
const descriptions = {
  "lock-versions": "Lock dependency versions to those currently installed",
  "check-compromised": "Check for known vulnerabilities in dependencies",
};
const description = "DESCRIPTION\n\tSecurity tools for next-ove.";

const schemas = {
  "lock-versions": z.strictObject({
    __cmd__: z.literal("lock-versions"),
  }),
  "check-compromised": z.strictObject({
    __cmd__: z.literal("check-compromised"),
  }),
};

const schema = makeSchema(schemas);

const lockVersions = (args: { dryRun: boolean }) => {
  const cwd = process.cwd();
  const toolDir = path.join(
    import.meta.dirname,
    "..",
    "tools",
    "security",
    "lock-versions",
  );
  run(`cd ${toolDir} && ./lock-versions.sh && cd ${cwd}`, args.dryRun);
};

const checkCompromised = (args: { dryRun: boolean }) => {
  const cwd = process.cwd();
  const toolDir = path.join(
    import.meta.dirname,
    "..",
    "tools",
    "security",
    "check-compromised",
  );
  run(`cd ${toolDir} && ./check-compromised.sh && cd ${cwd}`, args.dryRun);
};

const runSecurity = (args: { __cmd__: string }) => {
  switch (args.__cmd__) {
    case "lock-versions":
      lockVersions(
        args as unknown as NonNullable<Parameters<typeof lockVersions>>[0],
      );
      break;
    case "check-compromised":
      checkCompromised(
        args as unknown as NonNullable<Parameters<typeof checkCompromised>>[0],
      );
      break;
    default:
      throw new Error("Unknown command");
  }
};

const args = parseArgs(schema, true, defaultAlias);

if (args.__cmd__ === undefined && args.help) {
  printSchemas(schemas, tagline, description, descriptions, help);
} else if (args.help) {
  printSchemas(schemas, tagline, description, descriptions, help, args.__cmd__);
} else {
  runSecurity(args);
}
