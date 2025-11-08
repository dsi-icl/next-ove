import http from "http";
import { Server } from "socket.io";
import type { Request, Response } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import * as auth from "./auth";
import { env } from "./env";
import {
  loadSigningKey,
  thirdPartySocketCookieMiddleware,
} from "@ove/ove-auth";

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
  path: env.SOCKETS.PATH,
});

io.engine.use(cookieParser());
io.engine.use(
  (
    req: Request & {
      _query: { sid?: string };
    },
    _res: Response,
    next: (err?: Error) => void,
  ) =>
    thirdPartySocketCookieMiddleware(
      req,
      next,
      {
        signingKey,
        cookieId: env.AUTH?.COOKIE_ID ?? "",
        algorithm: env.AUTH?.JWT_ALGORITHMS,
        audience: env.APP_NAME,
      },
      (role: string) => auth.authorize(role, env.SOCKETS.PATH),
    ),
);

export let signingKey: string | null = null;

loadSigningKey(env.AUTH?.SERVER_URL)
  .then((key) => {
    signingKey = key;
    if (signingKey !== null) {
      console.log("Loaded signing key");
    } else {
      console.log("Failed to load signing key");
    }
  })
  .catch(console.error);
