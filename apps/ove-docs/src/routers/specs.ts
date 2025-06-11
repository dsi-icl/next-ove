import * as glob from "glob";
import * as path from "path";
import express from "express";
import { components } from "../components";
import { contentRoot } from "../app";
import { env } from "../env";

// eslint-disable-next-line new-cap
export const router = express.Router();

const specs = components.specs ? glob.globSync(path
  .join(contentRoot, "specs", "*")).map(spec => ({
  href: `${env.SERVER.BASE_PATH}/${spec.replace("specs", "specs/static")
    .split("/").slice(-3).join("/")}`,
  label: spec.split("/").at(-1)?.split("_")?.at(0) ?? ""
})) : [];

router.get("/available", (_req, res) => void res.send(specs));
router.use("/static", express.static(path.join(contentRoot, "specs")));
