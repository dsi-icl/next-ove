import * as fs from "fs";
import * as path from "path";
import express from "express";
import { app, contentRoot } from "./app";
import { router as ApiRouter } from "./routers/api";
import { router as SpecsRouter } from "./routers/specs";
import { router as CoverageRouter } from "./routers/coverage";
import { router as FeaturesRouter } from "./routers/features";
import { router as PackagesRouter } from "./routers/packages";
import { components } from "./components";
import { env, logger, version } from "./env";

const staticBase = express.static(path.join(__dirname, 'public'));

const templates: Record<string, () => void> = {
  'main.js': () => fs.writeFileSync(path.join(__dirname, 'public', 'main.js'), fs.readFileSync(path.join(__dirname, 'assets', 'main.js')).toString().replaceAll('%BASE_PATH%', env.SERVER.BASE_PATH)),
};

const staticMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const file = req.url.split("/").at(-1) ?? "";
  switch (file) {
    case 'index.html':
    case '':
      fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), fs.readFileSync(path.join(__dirname, 'assets', 'index.html')).toString().replaceAll('%BASE_PATH%', env.SERVER.BASE_PATH));
      break;
    default:
      if (file in templates) {
        templates[file]();
      }
      break;
  }
  return staticBase(req, res, next);
};

app.use(`${env.SERVER.BASE_PATH}/api`, ApiRouter);
app.use(`${env.SERVER.BASE_PATH}/specs`, SpecsRouter);
app.use(`${env.SERVER.BASE_PATH}/coverage`, CoverageRouter);
app.use(`${env.SERVER.BASE_PATH}/features`, FeaturesRouter);
app.use(`${env.SERVER.BASE_PATH}/code`, express.static(path.join(contentRoot, 'code')));
app.use(`${env.SERVER.BASE_PATH}/types`, express.static(path.join(contentRoot, 'types')));
app.use(`${env.SERVER.BASE_PATH}/packages`, PackagesRouter);
app.use(`${env.SERVER.BASE_PATH}/compatibility/css/static`,
  express.static(path.join(contentRoot, 'css')));

app.get(`${env.SERVER.BASE_PATH}/version`, (_req, res) => void res.send({ version }));
app.get(`${env.SERVER.BASE_PATH}/components`, (_req, res) => void res.send(components));
app.use(`${env.SERVER.BASE_PATH}/`, staticMiddleware);

app.listen(env.SERVER.PORT, () =>
  logger.info(`Docs server listening on port ${env.SERVER.PORT} and on path ${env.SERVER.BASE_PATH || "/"}`));
