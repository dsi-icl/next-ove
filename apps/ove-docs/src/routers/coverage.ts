import express from "express";
import * as glob from "glob";
import * as path from "path";
import { contentRoot } from "../app";
import { components } from "../components";
import { env } from "../env";

// eslint-disable-next-line new-cap
export const router = express.Router();

const coverage = components.coverage
  ? glob
      .globSync(path.join(contentRoot, "coverage", "tests", "*"))
      .map((dir) => ({
        header: dir.split("/").at(-1),
        files: glob.globSync(path.join(dir, "*")).map((x) => ({
          href: `${env.SERVER.BASE_PATH}/${x
            .replace("coverage", "coverage/static")
            .split("/")
            .slice(-5)
            .join("/")}`,
          label: x.split("/").at(-1),
        })),
      }))
  : [];

router.get("/available", (_req, res) => void res.send(coverage));
router.use("/static", express.static(path.join(contentRoot, "coverage")));
