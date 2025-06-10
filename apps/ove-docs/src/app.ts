import * as path from "path";
import express from "express";

export const app = express();
export const contentRoot = process.env.ROOT ??
  path.join(__dirname, "..", "..", "..", "docs");
