// noinspection RequiredAttributes

import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { Command } from "commander";
import { z } from "zod";
import { glob } from "glob";

import { run } from "./utils/exec";
import { resolveFromRoot, resolveOutputPath } from "./utils/paths";

const program = new Command();

program
  .name("document")
  .description("Code and type documentation for the next-ove system")
  .option("--dry-run", "Print commands without executing")
  .showHelpAfterError();

const apiSchema = z.object({
  outDir: z.string().optional(),
  coreConfig: z.string().optional(),
  clientConfig: z.string().optional(),
  dryRun: z.boolean().optional(),
});
type ApiArgs = z.infer<typeof apiSchema>;

const codeSchema = z.object({
  input: z.string().optional(),
  config: z.string().optional(),
  outDir: z.string().optional(),
  dryRun: z.boolean().optional(),
});
type CodeArgs = z.infer<typeof codeSchema>;

const typesSchema = z.object({
  config: z.string().optional(),
  tsConfig: z.string().optional(),
  outDir: z.string().optional(),
  dryRun: z.boolean().optional(),
});
type TypesArgs = z.infer<typeof typesSchema>;

const buildSchema = z.object({
  component: z
    .enum([
      "code",
      "types",
      "apis",
      "css",
      "bundles",
      "packages",
      "features",
      "coverage",
      "specs",
    ])
    .optional(),
  codeDir: z.string().optional(),
  typesDir: z.string().optional(),
  apiDir: z.string().optional(),
  coverageDir: z.string().optional(),
  cssDir: z.string().optional(),
  bundleDir: z.string().optional(),
  packageDir: z.string().optional(),
  basePath: z.string().optional(),
  dryRun: z.boolean().optional(),
});
type BuildArgs = z.infer<typeof buildSchema>;

const api = async (args: ApiArgs): Promise<void> => {
  const outDir = resolveOutputPath(args.outDir, "out/documentation/api");

  const coreScript = resolveFromRoot(
    "apps",
    "ove-core",
    "open-api-generate.ts",
  );

  const clientScript = resolveFromRoot(
    "apps",
    "ove-client",
    "open-api-generate.ts",
  );

  await run("mkdir", ["-p", outDir], {
    dryRun: args.dryRun,
  });

  await run(
    "pnpx",
    [
      "tsx",
      coreScript,
      outDir,
      "--configFile",
      args.coreConfig ?? "api-config.json",
    ],
    { dryRun: args.dryRun },
  );

  await run(
    "pnpx",
    [
      "tsx",
      clientScript,
      outDir,
      "--configFile",
      args.clientConfig ??
        resolveOutputPath(
          "~/Application Support/Electron/ove-client-config.json",
          "",
        ),
    ],
    { dryRun: args.dryRun },
  );
};

const code = async (args: CodeArgs): Promise<void> => {
  const root = resolveFromRoot();
  const input = resolveOutputPath(args.input, ".");
  const config = resolveOutputPath(args.config, "tools/jsdoc/jsdoc.json");
  const outDir = resolveOutputPath(args.outDir, "out/documentation/code");

  await run("mkdir", ["-p", outDir], {
    dryRun: args.dryRun,
  });

  await run("pnpx", ["jsdoc", input, "-c", config], {
    cwd: root,
    dryRun: args.dryRun,
  });
};

const types = async (args: TypesArgs): Promise<void> => {
  const root = resolveFromRoot();
  const config = resolveOutputPath(args.config, "tools/typedoc/typedoc.json");
  const tsConfig = resolveOutputPath(args.tsConfig, "tsconfig.json");

  await run("pnpx", ["typedoc", "--options", config, "--tsconfig", tsConfig], {
    cwd: root,
    dryRun: args.dryRun,
  });
};

const generateHtml = async (
  inputFile: string,
  outputFile: string,
  template: string,
  title: string,
  args: BuildArgs,
): Promise<void> => {
  const outputDir = path.dirname(outputFile);

  await run("mkdir", ["-p", outputDir], {
    dryRun: args.dryRun,
  });

  await run(
    "pandoc",
    [inputFile, "-o", outputFile],
    { dryRun: args.dryRun },
  );

  if (!args.dryRun) {
    const content = await fs.readFile(
      outputFile,
      "utf-8",
    );

    const html = template
      .replace("%%title%%", title)
      .replace("%%body%%", content)
      .replaceAll(
        "%BASE_PATH%",
        args.basePath ?? "",
      );

    await fs.writeFile(outputFile, html);
  }
};

const generateTitleFromSegments = (segments: string[]): string => segments
  .filter(Boolean)
  .map((segment) =>
    segment
      .replace(/-/g, " ") // hyphen readable in title
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  )
  .join(" › ");

const resolveOutputPathForMarkdown = (
  file: string,
): { outputFile: string; titleSegments: string[] } => {
  const root = resolveFromRoot();
  const publicRoot = resolveFromRoot(
    "docs",
    "features",
    "public",
  );

  const relative = path.relative(root, file);

  if (relative === "README.md") {
    return {
      outputFile: path.join(
        publicRoot,
        "project",
        "index.html",
      ),
      titleSegments: ["Project"],
    };
  }

  if (relative.startsWith("docs/features/")) {
    const subPath = relative.replace(
      /^docs\/features\//,
      "",
    );

    return {
      outputFile: path.join(
        publicRoot,
        "features",
        subPath.replace(/\.md$/, ".html"),
      ),
      titleSegments: [
        "Features",
        ...subPath
          .replace(/\.md$/, "")
          .split(/[\\/]/),
      ],
    };
  }

  const topLevel = relative.split(/[\\/]/)[0];

  const categoryMap: Record<string, string> = {
    apps: "Apps",
    libs: "Libraries",
    tools: "Tools",
    cli: "CLI",
  };

  if (topLevel in categoryMap) {
    const subPath = relative.replace(
      new RegExp(`^${topLevel}[\\\\/]`),
      "",
    );

    return {
      outputFile: path.join(
        publicRoot,
        topLevel,
        subPath
          .replace(/README\.md$/, "index.html")
          .replace(/\.md$/, ".html"),
      ),
      titleSegments: [
        categoryMap[topLevel],
        ...subPath
          .replace(/README\.md$/, "")
          .replace(/\.md$/, "")
          .split(/[\\/]/)
          .filter(Boolean),
      ],
    };
  }

  return {
    outputFile: path.join(
      publicRoot,
      relative.replace(/\.md$/, ".html"),
    ),
    titleSegments: relative
      .replace(/\.md$/, "")
      .split(/[\\/]/),
  };
};

const buildFeatures = async (args: BuildArgs): Promise<void> => {
  const featuresRoot = resolveFromRoot("docs", "features");
  const publicRoot = path.join(featuresRoot, "public");

  const templatePath = resolveFromRoot("docs", "assets", "feature.html");

  if (!existsSync(templatePath)) {
    console.log("Missing feature template.");
    return;
  }

  const template = await fs.readFile(templatePath, "utf-8");

  await run("mkdir", ["-p", publicRoot], {
    dryRun: args.dryRun,
  });

  const DOC_SOURCES = [
    { name: "apps", dir: "apps" },
    { name: "libs", dir: "libs" },
    { name: "tools", dir: "tools" },
    { name: "cli", dir: "cli" },
  ];

  const markdownFiles = [
    ...(await glob(resolveFromRoot("docs", "features", "**/*.md"))),
    ...(
      await Promise.all(
        DOC_SOURCES.map((source) =>
          glob(resolveFromRoot(source.dir, "**/*.md")),
        ),
      )
    ).flat(),
    resolveFromRoot("README.md"),
  ];

  for (const file of markdownFiles) {
    if (!existsSync(file)) continue;

    const { outputFile, titleSegments } =
      resolveOutputPathForMarkdown(file);

    await generateHtml(
      file,
      outputFile,
      template,
      generateTitleFromSegments(titleSegments),
      args,
    );
  }

  console.log("Built feature documentation successfully.");
};

const build = async (args: BuildArgs): Promise<void> => {
  const docsDir = resolveFromRoot("docs");

  const copyIfExists = async (
    srcDefault: string,
    provided: string | undefined,
    message: string,
  ) => {
    const src = resolveOutputPath(provided, srcDefault);

    if (!existsSync(src)) {
      console.log(message);
      return;
    }

    await run("cp", ["-R", src, docsDir], {
      dryRun: args.dryRun,
    });
  };

  if (!args.component || args.component === "code") {
    await copyIfExists(
      "out/documentation/code",
      args.codeDir,
      "Missing code documentation.",
    );
  }

  if (!args.component || args.component === "types") {
    await copyIfExists(
      "out/documentation/types",
      args.typesDir,
      "Missing type documentation.",
    );
  }

  if (!args.component || args.component === "apis") {
    await copyIfExists(
      "out/documentation/api",
      args.apiDir,
      "Missing API documentation.",
    );
  }

  if (!args.component || args.component === "coverage") {
    await copyIfExists(
      "out/coverage",
      args.coverageDir,
      "Missing coverage documentation.",
    );
  }

  if (!args.component || args.component === "css") {
    await copyIfExists(
      "out/analysis/css",
      args.cssDir,
      "Missing CSS documentation.",
    );
  }

  if (!args.component || args.component === "bundles") {
    await copyIfExists(
      "out/analysis/bundle",
      args.bundleDir,
      "Missing bundle documentation.",
    );
  }

  if (!args.component || args.component === "packages") {
    await copyIfExists(
      "out/analysis/packages",
      args.packageDir,
      "Missing package documentation.",
    );
  }

  if (!args.component || args.component === "features") {
    await buildFeatures(args);
  }
};

program
  .command("api")
  .description("Document the next-ove APIs")
  .option("--out-dir <path>")
  .option("--core-config <path>")
  .option("--client-config <path>")
  .action(async (opts, cmd) => {
    const parsed = apiSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });
    await api(parsed);
  });

program
  .command("code")
  .description("Document the next-ove codebase")
  .option("--input <path>")
  .option("--config <path>")
  .option("--out-dir <path>")
  .action(async (opts, cmd) => {
    const parsed = codeSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });
    await code(parsed);
  });

program
  .command("types")
  .description("Document the next-ove type system")
  .option("--config <path>")
  .option("--ts-config <path>")
  .option("--out-dir <path>")
  .action(async (opts, cmd) => {
    const parsed = typesSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });
    await types(parsed);
  });

program
  .command("build")
  .description("Compile documentation into docs directory")
  .option("--component <component>")
  .option("--base-path <path>")
  .option("--code-dir <path>")
  .option("--types-dir <path>")
  .option("--api-dir <path>")
  .option("--coverage-dir <path>")
  .option("--css-dir <path>")
  .option("--bundle-dir <path>")
  .option("--package-dir <path>")
  .action(async (opts, cmd) => {
    const parsed = buildSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });
    await build(parsed);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
