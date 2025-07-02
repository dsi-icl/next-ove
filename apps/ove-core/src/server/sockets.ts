import auth from "./auth";
import { prisma } from "./db";
import { server } from "./server";
import { env, logger } from "../env";
import cookieParser from "cookie-parser";
import type { Request, Response } from "express";
import { instrument } from "@socket.io/admin-ui";
import { Server, type ServerOptions } from "socket.io";
import { socketCookieMiddleware } from "@ove/ove-auth";

export const io: Server = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "DELETE"],
    credentials: true
  },
  path: `${env.SOCKETS.PATH ?? ""}/${env.API_VERSION}`,
  maxHttpBufferSize: env.SOCKETS.MAX_HTTP_BUFFER_SIZE
} as Partial<ServerOptions>);

io.engine.use(cookieParser());
io.engine.use(
  async (
    req: Request & { _query: { sid?: string } },
    res: Response,
    next: (arg?: unknown) => void,
  ) =>
    socketCookieMiddleware(prisma, req, res, next, env.TOKENS, (role: string) =>
      auth.authorize(role, io.path()), auth.getCredentials(),
    ),
);

instrument(io, {
  auth: false,
  mode: env.ENVIRONMENT === "production" ? "production" : "development"
});

io.on("connection", (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on("disconnect", (reason) =>
    logger.info(`${socket.id} disconnecting with reason: ${reason}`)
  );
});
