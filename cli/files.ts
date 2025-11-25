import { z } from "zod";
import path from "node:path";
import {
  makeSchema,
  parseArgs,
  defaultAlias,
  printSchemas,
  run,
} from "./utils";
const tagline = "Manage next-ove asset files";
const help =
  'Use "npm run files [COMMAND] -- --help" for more information about a command';
const descriptions = {
  upload: "Upload a file to the asset store",
};
const description = "DESCRIPTION\n\tFile management for the next-ove system.";

const schemas = {
  upload: z.strictObject({
    __cmd__: z.literal("upload"),
  }),
};

const schema = makeSchema(schemas);

const upload = () => {
  const fp = path.join(import.meta.dirname, "..", "tools", "files", "upload.js");
  run(`node ${fp}`, args.dryRun);
};

const runAnalysis = (args: { __cmd__: string }) => {
  switch (args.__cmd__) {
    case "upload":
      upload();
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
  runAnalysis(args);
}
