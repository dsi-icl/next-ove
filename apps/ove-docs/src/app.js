const express = require("express");
const path = require("path");
module.exports.app = express();
module.exports.contentRoot = process.env.ROOT ??
  path.join(__dirname, "..", "..", "..", "docs");
