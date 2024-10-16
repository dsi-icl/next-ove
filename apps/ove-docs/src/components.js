const fs = require("fs");
const path = require("path");
const { contentRoot } = require("./app");

module.exports.components = {
  apis: fs.existsSync(path.join(contentRoot, "api")),
  specs: fs.existsSync(path.join(contentRoot, "specs")),
  coverage: fs.existsSync(path.join(contentRoot, "coverage")),
  code: fs.existsSync(path.join(contentRoot, "code")),
  types: fs.existsSync(path.join(contentRoot, "types")),
  features: fs.existsSync(path.join(contentRoot, "features")),
  formattedFeatures: fs
    .existsSync(path.join(contentRoot, "features", "public")),
  packages: fs.existsSync(path.join(contentRoot, "packages")),
  compatibility: fs.existsSync(path.join(contentRoot, "css"))
};
