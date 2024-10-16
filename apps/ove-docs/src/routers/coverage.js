const express = require("express");
const glob = require("glob");
const path = require("path");
const { contentRoot } = require("../app");
const { components } = require("../components");

// eslint-disable-next-line new-cap
const router = express.Router();

const coverage = components.coverage ?
  glob.globSync(path.join(contentRoot, "coverage", "tests", "*")).map(dir => ({
    header: dir.split("/").at(-1),
    files: glob.globSync(path.join(dir, "*")).map(x => ({
      href: `/${x.replace("coverage", "coverage/static")
        .split("/").slice(-5).join("/")}`,
      label: x.split("/").at(-1)
    }))
  })) : [];

router.get("/available", (_req, res) => res.send(coverage));
router.use("/static", express.static(path.join(contentRoot, "coverage")));

module.exports = router;
