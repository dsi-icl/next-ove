import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const res = execSync(`find ${path.join(import.meta.dirname, "..", "..", "node_modules", ".pnpm")} -maxdepth 1 -type d -name 'nx-electron@*' -print`).toString();
const configPath = path.join(res.trim(), "node_modules", "nx-electron", "src", "utils", "config.js");
const executorPath = path.join(res.trim(), "node_modules", "nx-electron", "src", "executors", "package", "executor.js");

const configFile = fs.readFileSync(configPath).toString().replace('main.js', 'main.cjs').replace('index.js', 'index.cjs').replace('[name].js', '[name].cjs');

fs.writeFileSync(configPath, configFile);

const executorFile = fs.readFileSync(executorPath).toString().replaceAll('main.js', 'main.cjs').replaceAll('index.js', 'index.cjs').replaceAll('[name].js', '[name].cjs').replaceAll("preload.js", "preload.cjs");

fs.writeFileSync(executorPath, executorFile);


