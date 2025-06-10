import express from "express";
import * as fs from "fs";
import { contentRoot } from "../app";
import * as path from "path";
import { env } from "../env";

// eslint-disable-next-line new-cap
export const router = express.Router();

router.get("/audit", async (_req, res) => {
  let template = fs.readFileSync(path
    .join(__dirname, "assets", "packages", "audit.html"))
    .toString();
  const data = fs
    .readFileSync(path.join(contentRoot, "packages", "audit.txt"))
    .toString()
    .slice(18)
    .replaceAll(/\n\n(.+)/g, (v) => {
      return `\n\n<h2>${v}</h2>`;
    })
    .replaceAll(/\n+/g, "<br />");
  template = template.replace("%%text%%", data).replaceAll("%BASE_PATH%", env.SERVER.BASE_PATH ?? "");

  res.send(template);
});

router.get("/deprecated", async (_req, res) => {
  let template = fs.readFileSync(path
    .join(__dirname, "assets", "packages", "deprecated.html"))
    .toString();
  const data = fs.readFileSync(path
    .join(contentRoot, "packages", "deprecated.txt")).toString().slice(25, -5)
    .replaceAll("\n", "<br />");

  template = template.replace("%%text%%", data);

  res.send(template);
});

router.get("/directory", async (_req, res) => {
  let template = fs.readFileSync(path
    .join(__dirname, "assets", "packages", "directory.html"))
    .toString();
  const overview = fs.readFileSync(path
    .join(contentRoot, "packages", "packages.txt")).toString()
    .replaceAll("\n", "<br />");
  const report = JSON.parse(fs.readFileSync(path
    .join(contentRoot, "packages", "packages.json")).toString());

  template = template.replace("%%text%%", overview);
  template = template.replace("const data = null;",
    `const data = ${JSON.stringify(report, undefined, 2)};`);

  res.send(template);
});

router.get("/report", async (_req, res) => {
  let template = fs.readFileSync(path
    .join(__dirname, "assets", "packages", "report.html"))
    .toString();
  const data = JSON.parse(fs.readFileSync(path
    .join(contentRoot, "packages", "security", "report.json")).toString());

  template = template.replace("const data = null;",
    `const data = ${JSON.stringify(data, undefined, 2)}`);

  res.send(template);
});

router.get("/treemap", async (_req, res) => res
  .sendFile(path.join(contentRoot, "packages", "security", "treemap.svg")));

router.get("/dependencies", async (_req, res) => {
  let template = fs.readFileSync(path
    .join(__dirname, "assets", "packages", "dependencies.html"))
    .toString();
  const data = fs.readFileSync(path
    .join(contentRoot, "packages", "security", "dependencies.csv")).toString();

  template = template.replace("const data = null;",
    `const data = ${JSON.stringify(data, undefined, 2)};`);

  res.send(template);
});

router.get("/updates", async (_req, res) => {
  let template = fs.readFileSync(path
    .join(__dirname, "assets", "packages", "updates.html"))
    .toString();
  const data = fs.readFileSync(path
    .join(contentRoot, "packages", "updates.txt"), "utf8")
    .toString().split("\n").map(line => line.trim());
  const map: Record<string, {dependencies: string[], devDependencies: string[]}> = {};
  let position: "dependencies" | "devDependencies" | null = null;
  let pkg: string | null = null;

  for (const line of data) {
    if (line === "") continue;
    else if (line === "dependencies") {
      position = "dependencies";
    } else if (line === "devDependencies") {
      position = "devDependencies";
    } else if (/.* - .*/.test(line)) {
      pkg = line.split(" - ").at(0) ?? null;
      map[pkg ?? ""] = { dependencies: [], devDependencies: [] };
    } else if (line.includes("→")) {
      map[pkg ?? ""][position ?? "dependencies"].push(line);
    }
  }

  template = template.replace("const data = null;",
    `const data = ${JSON.stringify(map, undefined, 2)};`);

  res.send(template);
});
