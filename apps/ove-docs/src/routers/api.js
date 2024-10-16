const { components } = require("../components");
const glob = require("glob");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const express = require("express");
const { contentRoot } = require("../app");
const Router = require("express").Router;

const docs = components.apis ?
  glob.globSync(path.join(contentRoot, "api", "*")).map(dir => ({
    header: dir.split("/").at(-1),
    files: glob.globSync(path.join(dir, "*")).map(x => ({
      href: `/${x.split("/").slice(-3).join("/")}`,
      label: x.split("/").at(-1).split(".").at(0)
    }))
  })) : [];

const apis = docs.map(({ header, files }) => ({
  header,
  files: files.map(({ label }) => ({
    href: `/api/view?urls.primaryName=${encodeURIComponent(
      `${header}/${label}`)}`,
    label
  }))
}));

const swaggerUrls = docs.flatMap(({ header, files }) => files
  .map(({ href, label }) => ({
    url: `${href.replace("api", "api/static")}`,
    name: `${header}/${label}`
  })));

// eslint-disable-next-line new-cap
const router = Router();

router.use("/static", express.static(path.join(contentRoot, "api")));
router.use("/view", swaggerUi.serve,
  swaggerUi.setup(undefined, { swaggerUrls }));
router.get("/available", (_req, res) => res.send(apis));

module.exports = router;
