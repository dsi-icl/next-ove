import * as express from "express";
import * as http from "http";

export const app = express();

export const server = http.createServer(app);