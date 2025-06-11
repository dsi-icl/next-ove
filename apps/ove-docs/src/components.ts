import * as fs from "fs";
import * as path from "path";
import { contentRoot } from "./app";


export const components = {
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
