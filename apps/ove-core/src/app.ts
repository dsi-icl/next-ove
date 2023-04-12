import { Logging } from "@ove/ove-utils";
import * as express from "express";
import * as http from "http";

export const logger = Logging.logger("ove-core", -1);
export const app = express();
export const server = http.createServer(app);

