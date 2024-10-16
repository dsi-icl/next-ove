const express = require("express");
const glob = require("glob");
const path = require("path");
const { components } = require("../components");
const { contentRoot } = require("../app");

// eslint-disable-next-line new-cap
const router = express.Router();

const featureSpecs = components.features ? glob
  .globSync(path.join(contentRoot, "features",
    components.formattedFeatures ? "public" : "", "*"))
  .filter(x => x !== "public").map(file => ({
    href: `/${file.replace("features", "features/static")
      .split("/")
      .filter(x => x !== "public").slice(-3).join("/")}`,
    label: file.split("/").at(-1).split(".").at(0)
  })) : [];

router.use("/static", express.static(path.join(contentRoot, "features",
  components.formattedFeatures ? "public" : "")));
router.get("/available", (_req, res) => res.send(featureSpecs));

module.exports = router;
