import { procedure, router } from "../trpc";
import { z } from "zod";
import { logger, env } from "../../env";
import * as glob from "glob";
import * as fs from "node:fs";
import * as path from "node:path";

type DocNode = {
  title: string;
  path?: string;        // present if file
  children?: DocNode[]; // present if directory
};

const buildTree = (
  dir: string,
  root: string,
): DocNode[] => {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() ||
        entry.name.endsWith(".html"),
    )
    .toSorted((a, b) =>
      a.name.localeCompare(b.name),
    );

  return entries.map((entry) => {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      return {
        title: entry.name,
        children: buildTree(fullPath, root),
      };
    }

    return {
      title: entry.name.replace(/\.html$/, ""),
      path:
        "/docs/features/public/" +
        relative.replace(/\\/g, "/"),
    };
  });
};

export const docsRouter = router({
  getSpecs: procedure.meta({
    openapi: {
      method: "GET" as const,
      path: "/docs/specs" as const,
      protect: true,
    },
  }).input(z.void()).output(z.string().array()).query(() => {
    logger.info("Getting specifications list");
    if (env.DOCS === undefined) return [];
    return glob.globSync(path.join(env.DOCS, "specs", "*")).map((path) => "/docs/" + path.split("/").slice(-2).join("/")).toSorted();
  }),
  getFeatures: procedure.meta({
    openapi: {
      method: "GET" as const,
      path: "/docs/features" as const,
      protect: true,
    },
  }).input(z.void()).output(
    z.array(
      z.object({
        title: z.string(),
        path: z.string().optional(),
        children: z.lazy(() =>
          z.array(
            z.object({
              title: z.string(),
              path: z.string().optional(),
              children: z.any().optional(),
            }),
          ),
        ).optional(),
      }),
    ),
  )
    .query(() => {
      logger.info("Getting feature documentation");

      if (!env.DOCS) return [];

      const root = path.join(
        env.DOCS,
        "features",
        "public",
      );

      if (!fs.existsSync(root)) return [];

      return buildTree(root, root);
    }),
  getBundles: procedure.meta({
    openapi: {
      method: "GET" as const,
      path: "/docs/bundles" as const,
      protect: true,
    },
  }).input(z.void()).output(z.string().array()).query(() => {
    logger.info("Getting bundle analysis documentation");
    if (env.DOCS === undefined) return [];
    return glob.globSync(path.join(env.DOCS, "bundle", "*.html")).map((path) => "/docs/" + path.split("/").slice(-2).join("/")).toSorted();
  }),
  getAPIs: procedure.meta({
    openapi: {
      method: "GET" as const,
      path: "/docs/apis" as const,
      protect: true,
    },
  }).input(z.void()).output(z.string().array()).query(() => {
    logger.info("Getting API documentation");
    if (env.DOCS === undefined) return [];
    return glob.globSync(path.join(env.DOCS, "api", "**/*.openapi.json")).flatMap((path) => "/docs/" + path.split("/").slice(-3).join("/")).toSorted();
  }),
  getTests: procedure.meta({
    openapi: {
      method: "GET" as const,
      path: "/docs/tests" as const,
      protect: true,
    },
  }).input(z.void()).output(z.string().array()).query(() => {
    logger.info("Getting test result and coverage documentation");
    if (env.DOCS === undefined) return[];
    return glob.globSync(path.join(env.DOCS, "coverage", "tests", "**/*.html")).flatMap((path) => "/docs/" + path.split("/").slice(-4).join("/")).toSorted();
  }),
});