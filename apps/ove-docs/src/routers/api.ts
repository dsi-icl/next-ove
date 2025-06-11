import { components } from "../components";
import * as glob from "glob";
import * as path from "path";
import * as swaggerUi from "swagger-ui-express";
import express from "express";
import { contentRoot } from "../app";
import { env } from "../env";

const Router = express.Router;

// TODO: replace with Scalar
const docs = components.apis
  ? glob.globSync(path.join(contentRoot, "api", "*")).map((dir) => ({
      header: dir.split("/").at(-1),
      files: glob.globSync(path.join(dir, "*")).map((x) => ({
        href: `${env.SERVER.BASE_PATH}/${x.split("/").slice(-3).join("/")}`,
        label: x.split("/").at(-1)?.split(".")?.at(0) ?? "",
      })),
    }))
  : [];

const apis = docs.map(({ header, files }) => ({
  header,
  files: files.map(({ label }) => ({
    href: `${env.SERVER.BASE_PATH}/api/view?urls.primaryName=${header}.${label}`,
    label,
  })),
}));

const swaggerUrls = docs.flatMap(({ header, files }) =>
  files.map(({ href, label }) => ({
    url: `${href.replace("/api", `/api/static`)}`,
    name: `${header}${label}`,
  })),
);

// eslint-disable-next-line new-cap
export const router = Router();

router.use("/static", express.static(path.join(contentRoot, "api")));
router.use(
  "/view",
  swaggerUi.serve,
  // @ts-expect-error setup is incorrectly typed
  swaggerUi.setup(undefined, { swaggerUrls }),
);
router.get("/available", (_req, res) => void res.send(apis));
