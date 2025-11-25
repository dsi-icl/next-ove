import path from "node:path";
import {
  printSchemas,
  handlePathname,
  run,
  parseArgs,
  defaultAlias,
  makeSchema,
} from "./utils";
import { z } from "zod";

const tagline = "Analyse the next-ove system";
const help =
  'Use "npm run analyse [COMMAND] -- --help" for more information about a command';
const descriptions = {
  api: "Generate API documentation for the next-ove system",
  bundle: "Analyse the web bundle of the UI components",
  packages:
    "Audit and list dependencies, identify security issues and deprecations",
  css: "Analyse CSS browser compatibility",
  coverage:
    "Determine the coverage of TypeScript types throughout the codebase",
};
const description =
  "DESCRIPTION\n\tPackage & bundle analysis, css compatibility and type checking & coverage for the next-ove system.";

const schemas = {
  bundle: z.strictObject({
    __cmd__: z.literal("bundle"),
    component: z
      .union([z.literal("core"), z.literal("bridge"), z.literal("client")])
      .optional(),
    open: z.coerce.boolean().optional(),
    outDir: z.string().optional(),
  }),
  packages: z.strictObject({
    __cmd__: z.literal("packages"),
    outDir: z.string().optional(),
  }),
  css: z.strictObject({
    __cmd__: z.literal("css"),
    outDir: z.string().optional(),
  }),
  coverage: z.strictObject({
    __cmd__: z.literal("coverage"),
    outDir: z.string().optional(),
  }),
};

const schema = makeSchema(schemas);

const bundle = (args: { open: boolean; component: string | undefined; outDir: string; dryRun: boolean }) => {
  const bundleComponent = (c: string) => {
    const appDir = path.join(import.meta.dirname, "..", "apps", `ove-${c}-ui`);
    const open = args.open ?? false;
    const outDir = handlePathname(args.outDir, "out/analysis/bundle");
    const output = path.join(outDir, `ove-${c}.html`);
    const distDir = path.join(import.meta.dirname, "..", "dist");

    [
      `mkdir -p ${outDir}`,
      `cd ${appDir} && npx vite-bundle-visualizer --open=${open} --output=${output}`,
      `npx rimraf ${distDir}`,
    ].forEach((x) => run(x, args.dryRun));
  };

  if (args.component === undefined) {
    bundleComponent("client");
    bundleComponent("bridge");
    bundleComponent("core");
  } else {
    bundleComponent(args.component);
  }
};

const packages = (args: { outDir: string; dryRun: boolean; }) => {
  const outDir = handlePathname(args.outDir, "out/analysis/packages");
  const auditOutput = path.join(outDir, "audit.txt");
  const deprecationDir = path.join(import.meta.dirname, "..", "tools", "deprecation");
  const deprecation = path.join(deprecationDir, "analyze.sh");
  const deprecationOutput = path.join(deprecationDir, "analysis.txt");
  const deprecationOutputDest = path.join(outDir, "deprecated.txt");
  const sandwormOutput = path
    .join(path.relative(import.meta.dirname, outDir), "security")
    .replace("../", "");
  const packagesTxt = path.join(outDir, "packages.txt");
  const packagesJSON = path.join(outDir, "packages.json");
  const updates = path.join(outDir, "updates.txt");

  [
    `mkdir -p ${sandwormOutput}`,
    `npm audit > ${auditOutput}`,
    `${deprecation}`,
    `cp ${deprecationOutput} ${deprecationOutputDest}`,
    `npm ls --all --json --silent > ${packagesJSON}`,
    `npm ls --all --silent > ${packagesTxt}`,
    `tail -n +2 ${packagesTxt} > ${packagesTxt}`,
    `npx sandworm-audit --summary -d --max-depth=3 -o ${sandwormOutput}`,
    `npx taze -l -r --ignore-paths node_modules major --sort time-desc > ${updates}`,
  ].forEach((x) => run(x, args.dryRun));
};

const css = (args: { outDir: string; dryRun: boolean; }) => {
  const outDir = handlePathname(args.outDir, "out/analysis/css");
  const doiuse = path.join(import.meta.dirname, "..", "tools", "doiuse", "doiuse.js");
  const output = path.join(outDir, "browser-usage.json");

  run(`node ${doiuse} ${output}`, args.dryRun);
};

const coverage = (args: { outDir: string; dryRun: boolean; }) => {
  const outDir = handlePathname(args.outDir, "out/coverage/types");

  [`mkdir -p ${outDir}`, `npx typescript-coverage-report -o ${outDir}`].forEach(
    (x) => run(x, args.dryRun),
  );
};

const runAnalysis = (args: any) => {
  switch (args.__cmd__) {
    case "bundle":
      bundle(args);
      break;
    case "packages":
      packages(args);
      break;
    case "css":
      css(args);
      break;
    case "coverage":
      coverage(args);
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
