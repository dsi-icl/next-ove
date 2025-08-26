import { env } from "../env";
import * as fs from "node:fs";
import * as https from "node:https";

export const getAgent = () => {
  if (env.CORE.SSL === undefined) return undefined;
  return new https.Agent({
    ca: fs.readFileSync(env.CORE.SSL.CA),
    cert: fs.readFileSync(env.CORE.SSL.CERT),
    key: fs.readFileSync(env.CORE.SSL.KEY),
  });
};