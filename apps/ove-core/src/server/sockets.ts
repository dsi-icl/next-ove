import auth from "./auth";
import { prisma } from "./db";
import { server } from "./server";
import { env, logger } from "../env";
import cookieParser from "cookie-parser";
import type { Request, Response } from "express";
import { instrument } from "@socket.io/admin-ui";
import { Server, type ServerOptions } from "socket.io";

export const io: Server = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
  path: `${env.SOCKETS.PATH ?? ""}/${env.API_VERSION}`,
  maxHttpBufferSize: env.SOCKETS.MAX_HTTP_BUFFER_SIZE,
} as Partial<ServerOptions>);

io.engine.use(cookieParser());
io.engine.use(
  async (
    req: Request & { _query: { sid?: string } },
    res: Response,
    next: (arg?: unknown) => void,
  ) => {
    const handshake = req._query.sid === undefined;
    if (!handshake) {
      next();
      return;
    }
    try {
      const [access, refresh] = auth.extractCookies(req);
      const { role } = await auth.validateCookies(res, prisma, access, refresh);
      if (!auth.authorize(role, env.SOCKETS.PATH ?? "/socket.io")) {
        next(new Error("UNAUTHORIZED"));
        return;
      }
      next();
    } catch (_e) {
      next(new Error("UNAUTHORIZED"));
    }
  },
);

instrument(io, {
  auth: false,
  mode: env.ENVIRONMENT === "production" ? "production" : "development",
});

io.on("connection", (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on("disconnect", (reason) =>
    logger.info(`${socket.id} disconnecting with reason: ${reason}`),
  );
});
