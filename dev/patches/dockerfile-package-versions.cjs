const fs = require("fs");
const path = require("path");
const packageJson = require(path.join(__dirname, "..", "..", "package.json"));

const dependencies = new Map();

const loadDependencies = ([dependency, version]) => {
  dependencies.set(dependency, version.replaceAll("^", "").replaceAll("~", ""));
};

Object.entries(packageJson.dependencies).forEach(loadDependencies);
Object.entries(packageJson.devDependencies).map(loadDependencies);

const paths = [
  path.join(__dirname, "..", "..", "apps", "ove-core", "Dockerfile"),
  path.join(__dirname, "..", "..", "apps", "ove-logs", "Dockerfile"),
];

const rebuildDockerfile = (path) => {
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
