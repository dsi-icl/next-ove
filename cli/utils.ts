import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { ZodEffects, z } from "zod";

const tab = "  ";

const formatSchema = (schema: any) => {
  const formatOption = <T extends Record<string, {isOptional: () => boolean}>>(args: T, k: string) => (args[k].isOptional() ? `[${k}]` : k);

  if (Object.keys(schema).length > 1) {
    return `${schema.__cmd__.value}: ${Object.keys(schema)
      .filter((x) => x !== "__cmd__")
      .map(formatOption.bind(null, schema))
      .join(" ")}`;
  } else {
    return schema.__cmd__?.value;
  }
};

const pad = <T>(arr: T[][], key: number) => {
  const maxLen = arr.reduce((l, x) => Math.max(l, x.length), 0);
  return `${arr[key]}${Array.from({ length: maxLen - arr[key].length })
    .map(() => " ")
    .join("")}`;
};

const getShape = (schema: any) =>
  schema instanceof ZodEffects ? schema._def.schema.shape : schema.shape;

export const printSchemas = (
  schemas: any,
  tagline: string,
  description: string,
  descriptions: Record<string, string>,
  help: string,
  command?: string,
) => {
  if (command !== undefined) {
    console.log(formatSchema(getShape(schemas[command])));
    return;
  }
  console.log(`next-ove CLI v${process.env.npm_package_version}\n`);
  console.log(`${tagline}\n`);
  console.log(`${description}\n`);
  console.log(`USAGE`);
  Object.values(schemas)
    .map(getShape)
    .map(formatSchema)
    .filter(Boolean)
    .forEach((output, i, arr) => {
      console.log(
        `${tab}${pad(
          arr.map((x) => x.split(": ")[0]),
          i,
        )}  ${output.split(": ").at(1) ?? ""}`,
      );
    });
  console.log("\nAvailable Commands");
  Object.values(schemas)
    .map((schema) => getShape(schema).__cmd__?.value)
    .filter(Boolean)
    .forEach((cmd, i, arr) =>
      console.log(`${tab}${pad(arr, i)}${tab}${descriptions[cmd] ?? ""}`),
    );
  console.log("\nFlags");
  console.log(`${tab}-h, --help${tab} help for next-ove CLI`);
  console.log(`${help}`);
};

export const handlePathname = (output: string | undefined, default_: string, suffix?: string) => {
  if (output === undefined) {
    if (path.isAbsolute(default_)) {
      return path.join("/", ...default_.split("/"), suffix ?? "");
    } else if (default_.startsWith("~")) {
      return path.join(
        ...default_.replace("~", os.homedir()).split("/"),
        suffix ?? "",
      );
    } else {
      return path.join(import.meta.dirname, "..", ...default_.split("/"), suffix ?? "");
    }
  } else if (output.startsWith("/")) {
    return path.join("/", ...output.split("/"), suffix ?? "");
  } else if (output.startsWith("~")) {
    return path.join(...output.split("/"), suffix ?? "");
  } else {
    return path.join(import.meta.dirname, "..", ...output.split("/"), suffix ?? "");
  }
};

export const run = (command: string, dryRun: boolean = false) => {
  if (dryRun) {
    console.log(command);
  } else {
    try {
      execSync(command, { stdio: "inherit" });
    } catch (_e) {
      console.error("Command failed:", command);
    }
  }
};

export const parseArgs = function (
  schema: any,
  hasCommand: boolean,
  alias: any = {},
  extraArgs: any = {},
) {
  let hasFlag = false;
  const args = process.argv
    .reduce(
      (args, arg, i) => {
        const [k, v] = arg.split("=");
        if (arg.startsWith("--")) {
          hasFlag = true;
          args[k.slice(2)] = v ?? true;
          return args;
        } else if (arg.startsWith("-")) {
          hasFlag = true;
          args[alias[k.slice(1)] ?? k.slice(1)] = v ?? true;
          return args;
        } else {
          if (hasFlag) throw new Error("Arguments out of order");
          args._.push(arg);
          switch (i) {
            case 0:
              args.__program__ = arg;
              args._.shift();
              break;
            case 1:
              args.__entrypoint__ = arg;
              args._.shift();
              break;
            case 2:
              if (hasCommand) {
                args.__cmd__ = arg;
                args._.shift();
                break;
              }
            default:
              const p = extraArgs[args.__cmd__] ?? [];
              if (p.length < i - 3) break;
              args[p[i - 3]] = arg;
              break;
          }
          return args;
        }
      },
      { _: [] } as any,
    );
  return args.help ? args : schema.parse(args);
};

export const defaultSchema = z.strictObject({
  __program__: z.string(),
  __entrypoint__: z.string(),
  _: z.string().array(),
  help: z.boolean().optional(),
  dryRun: z.boolean().optional(),
});

export const defaultAlias = {
  h: "help",
};

export const makeSchema = <T extends Record<string, z.ZodTypeAny>>(schemas: T, refinements: any = {}) =>
  z.union(
    Object.entries(schemas).map(([k, schema]: [k: string, schema: any]) => {
      const extended = schema.extend(defaultSchema.shape);
      if (k in refinements) {
        return extended.refine(refinements[k]);
      }
      return extended;
    }) as any,
  );
