import fs from "node:fs";
import path from "node:path";
const packageJson = JSON.parse(fs.readFileSync(
  path.join(import.meta.dirname, "..", "..", "package.json"),
).toString()) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

const dependencies = new Map<string, string>();

const loadDependencies = ([dependency, version]: [string, string]) => {
  dependencies.set(dependency, version.replaceAll("^", "").replaceAll("~", ""));
};

Object.entries(packageJson.dependencies).forEach(loadDependencies);
Object.entries(packageJson.devDependencies).map(loadDependencies);

const paths = [
  path.join(import.meta.dirname, "..", "..", "apps", "ove-core", "Dockerfile"),
  path.join(import.meta.dirname, "..", "..", "apps", "ove-logs", "Dockerfile"),
  path.join(import.meta.dirname, "..", "..", "apps", "ove-docs", "Dockerfile"),
];

const rebuildDockerfile = (path: string) => {
  let dockerfile = fs.readFileSync(path, "utf8").toString().split("\n");

  dockerfile = dockerfile.map((line) => {
    for (const [dependency, version] of dependencies.entries()) {
      line = line.replace(
        new RegExp(` ${dependency}@[^ ]+`),
        ` ${dependency}@${version}`,
      );
    }

    return line;
  });

  fs.writeFileSync(path, dockerfile.join("\n"));
};

paths.forEach(rebuildDockerfile);
