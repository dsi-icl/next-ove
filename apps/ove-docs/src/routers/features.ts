import express from "express";
import * as glob from "glob";
import * as path from "path";
import { components } from "../components";
import { contentRoot } from "../app";
import { env } from "../env";


// eslint-disable-next-line new-cap
export const router = express.Router();

const featureSpecs = components.features ? glob
  .globSync(path.join(contentRoot, "features",
    components.formattedFeatures ? "public" : "", "*"))
  .filter(x => x !== "public").map(file => ({
    href: `${env.SERVER.BASE_PATH}/${file.replace("features", "features/static")
      .split("/")
      .filter(x => x !== "public").slice(-3).join("/")}`,
    label: file.split("/").at(-1)?.split(".")?.at(0) ?? ""
  })) : [];

router.use("/static", express.static(path.join(contentRoot, "features",
  components.formattedFeatures ? "public" : "")));
router.get("/available", (_req, res) => void res.send(featureSpecs));
