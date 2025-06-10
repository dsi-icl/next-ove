import http from "http";
import { Server } from "socket.io";
import type { Request, Response } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import * as auth from "./auth";
import { env } from "./env";

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
  ) => {
    const handshake = req._query.sid === undefined;
    if (!handshake) {
      next();
      return;
    }
    try {
      const access = auth.extractCookie(req);
      const { role } = auth.validateCookie(access);
      if (!auth.authorize(role, env.SOCKETS.PATH)) {
        next(new Error("UNAUTHORIZED"));
        return;
      }
      next();
    } catch (e) {
      next(new Error("UNAUTHORIZED"));
    }
  },
);

export let signingKey: string | null = null;

const load = async () => {
  if (env.AUTH?.SERVER_URL === undefined) return;
  try {
    signingKey = await (await fetch(env.AUTH.SERVER_URL, {
      credentials: "include"
    })).text();
  } catch (e) {
    console.error(e);
  }
};

load().catch(console.error);
