import path from "node:path";
import {
  defaultAlias,
  handlePathname,
  makeSchema,
  parseArgs,
  printSchemas,
  run,
} from "./utils";
import glob from "glob";
import { z } from "zod";

import fs from "node:fs";
import { execSync } from "node:child_process";

const tagline = "Document the next-ove system";
const help =
  'Use "npm run document [COMMAND] -- --help" for more information about a command';
const descriptions = {
  api: "Document the next-ove APIs",
  code: "Document the next-ove codebase",
  types: "Document the next-ove codebase's types",
  build: "Compile documentation into 'docs' directory",
  show: "Run doc-viewer to display documentation as web application",
};
const description =
  "DESCRIPTION\n\tCode and type documentation for the next-ove system.";

const schemas = {
  api: z.strictObject({
    __cmd__: z.literal("api"),
    outDir: z.string().optional(),
    coreConfig: z.string().optional(),
    clientConfig: z.string().optional(),
  }),
  code: z.strictObject({
    __cmd__: z.literal("code"),
    input: z.string().optional(),
    config: z.string().optional(),
    outDir: z.string().optional(),
  }),
  types: z.strictObject({
    __cmd__: z.literal("types"),
    config: z.string().optional(),
    tsConfig: z.string().optional(),
    outDir: z.string().optional(),
  }),
  build: z.strictObject({
    __cmd__: z.literal("build"),
    codeDir: z.string().optional(),
    typesDir: z.string().optional(),
    apiDir: z.string().optional(),
    coverageDir: z.string().optional(),
    cssDir: z.string().optional(),
    basePath: z.string().optional(),
  }),
  show: z.strictObject({
    __cmd__: z.literal("show"),
  }),
};

const schema = makeSchema(schemas);

const code = (args: {
  input: string;
  config: string;
  outDir: string;
  dryRun: boolean;
}) => {
  const input = handlePathname(args.input, ".");
  const config = handlePathname(args.config, "tools/jsdoc/jsdoc.json");
  const outDir = handlePathname(args.outDir, "out/documentation");
  const rootDir = path.join(import.meta.dirname, "..");

  [
    `mkdir -p ${outDir}`,
    `cd ${rootDir} && npx jsdoc ${input} -c ${config}`,
  ].forEach((x) => run(x, args.dryRun));
};

const types = (args: {
  config: string;
  tsConfig: string;
  outDir: string;
  dryRun: boolean;
}) => {
  const config = handlePathname(args.config, "tools/typedoc/typedoc.json");
  const tsConfig = handlePathname(args.tsConfig, "tsconfig.json");
  const rootDir = path.join(import.meta.dirname, "..");
  const outDir = handlePathname(args.outDir, "out/documentation");

  [
    `mkdir -p ${outDir}`,
    `cd ${rootDir} && npx typedoc --options ${config} --tsconfig ${tsConfig}`,
  ].forEach((x) => run(x, args.dryRun));
};

const build = (args: {
  codeDir: string;
  typesDir: string;
  apiDir: string;
  coverageDir: string;
  basePath: string;
  packageDir: string;
  dryRun: boolean;
  cssDir: string;
}) => {
  const docsDir = path.join(import.meta.dirname, "..", "docs");
  const specsDir = path.join(import.meta.dirname, "..", "docs", "specs");

  const buildCode = () => {
    const codeDir = handlePathname(args.codeDir, "out/documentation/code");
    if (!fs.existsSync(codeDir)) {
      console.log(
        'Missing code documentation, this can be generated using "npm run analyse code".',
      );
      return [];
    }
    return [`cp -R ${codeDir} ${docsDir}`];
  };

  const buildTypes = () => {
    const typesDir = handlePathname(args.typesDir, "out/documentation/types");
    if (!fs.existsSync(typesDir)) {
      console.log(
        'Missing type documentation, this can be generated using "npm run analyse types".',
      );
      return [];
    }
    return [`cp -R ${typesDir} ${docsDir}`];
  };

  const buildAPIs = () => {
    const apiDir = handlePathname(args.apiDir, "out/documentation/api");
    if (!fs.existsSync(apiDir)) {
      console.log(
        'Missing API documentation, this can be generated using "npm run analyse api".',
      );
      return [];
    }
    return [`cp -R ${apiDir} ${docsDir}`];
  };

  const buildCoverage = () => {
    const coverageDir = handlePathname(args.coverageDir, "out/coverage");
    if (!fs.existsSync(coverageDir)) {
      console.log(
        'Missing test & type coverage, this can be generated using "npm run test" for test coverage and "npm run analyse types" for type coverage.',
      );
      return [];
    }
    return [`cp -R ${coverageDir} ${docsDir}`];
  };

  const buildFeatures = () => {
    const featuresDir = path.join(import.meta.dirname, "..", "docs", "features");
    if (!fs.existsSync(featuresDir)) {
      console.log(
        "Missing feature documentation, this can be found on the GitHub.",
      );
      return [];
    }
    let pandocInstalled;
    const featuresPublicDir = path.join(featuresDir, "public");
    const template = path.join(
      import.meta.dirname,
      "..",
      "apps",
      "ove-docs",
      "src",
      "assets",
      "feature.html",
    );

    try {
      execSync("pandoc -v");
      pandocInstalled = true;
    } catch (e) {
      pandocInstalled = false;
    }

    if (!pandocInstalled) {
      console.log(
        "Using unformatted feature documentation, for formatted output, please install pandoc.",
      );
      return [];
    }

    return [
      `mkdir -p ${featuresPublicDir}`,
      ...glob
        .globSync(path.join(import.meta.dirname, "..", "docs", "features", "*.md"))
        .flatMap((feature) => {
          const name =
            feature.split("/").at(-1)?.split(".")?.at(0) ?? "unknown";
          const title = name
            .split("-")
            .map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
            .join(" ");
          const file = path.join(featuresPublicDir, `${name}.html`);

          return [
            `pandoc ${feature} > ${file}`,
            `node -e "${[
              "const fs = require('fs')",
              `const data = fs.readFileSync('${file}').toString()`,
              `const template = fs.readFileSync('${template}').toString().replace('%%title%%', '${title}').replace('%%body%%', data).replaceAll('%BASE_PATH%', '${args.basePath ?? ""}')`,
              `fs.writeFileSync('${file}', template);`,
            ].join("; ")}"`,
          ];
        }),
    ];
  };

  const buildPackages = () => {
    const packagesDir = handlePathname(
      args.packageDir,
      "out/analysis/packages",
    );
    if (!fs.existsSync(packagesDir)) {
      console.log(
        'Missing package analysis, this can be generated using "npm run analyse packages".',
      );
      return [];
    }
    return [`cp -R ${packagesDir} ${docsDir}`];
  };

  const buildCSS = () => {
    const cssDir = handlePathname(args.cssDir, "out/analysis/css");
    if (!fs.existsSync(cssDir)) {
      console.log(
        'Missing CSS compatibility information, this can be generated using "npm run analyse css".',
      );
      return [];
    }
    return [`cp -R ${cssDir} ${docsDir}`];
  };

  if (!fs.existsSync(specsDir)) {
    console.log("Missing specifications, these can be found on the GitHub");
  }

  [
    ...buildCSS(),
    ...buildPackages(),
    ...buildTypes(),
    ...buildCode(),
    ...buildAPIs(),
    ...buildCoverage(),
    ...buildFeatures(),
  ].forEach((x) => run(x, args.dryRun));
};

const api = (args: {
  outDir: string;
  coreConfig: string;
  clientConfig: string;
  dryRun: boolean;
}) => {
  const core = path.join(
    import.meta.dirname,
    "..",
    "apps",
    "ove-core",
    "open-api-generate.ts",
  );
  const client = path.join(
    import.meta.dirname,
    "..",
    "apps",
    "ove-client",
    "open-api-generate.ts",
  );
  const outDir = handlePathname(args.outDir, "out/documentation/api");
  const coreConfig = args.coreConfig ?? "api-config.json";
  const clientConfig = handlePathname(
    args.clientConfig,
    "~/Application Support/Electron/ove-client-config.json",
  );
  [
    `mkdir -p "${outDir}"`,
    `npx tsx ${core} ${outDir} --configFile="${coreConfig}"`,
    `npx tsx ${client} ${outDir} --configFile="${clientConfig}"`,
  ].forEach((x) => run(x, args.dryRun));
};

const show = () => {
  const docsDir = path.join(import.meta.dirname, "..", "apps", "ove-docs");
  run(`cd ${docsDir} && node server.js`, args.dryRun);
};

const runDocumentation = (args: { __cmd__: string; }) => {
  switch (args.__cmd__) {
    case "api":
      api(args as unknown as NonNullable<Parameters<typeof api>>[0]);
      break;
    case "code":
      code(args as unknown as NonNullable<Parameters<typeof code>>[0]);
      break;
    case "types":
      types(args as unknown as NonNullable<Parameters<typeof types>>[0]);
      break;
    case "build":
      build(args as unknown as NonNullable<Parameters<typeof build>>[0]);
      break;
    case "show":
      show();
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
  runDocumentation(args);
}
