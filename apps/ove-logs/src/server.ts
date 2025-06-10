import cors from "cors";
import { app, server } from "./app";
import v1 from "./v1/router";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import * as auth from "./auth";
import { env } from "./env";

app.use(cors({origin: true, credentials: true}));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: env.API.RATE_LIMIT.WINDOW_MS,
    limit: env.API.RATE_LIMIT.LIMIT,
    standardHeaders: env.API.RATE_LIMIT.STANDARD_HEADERS,
    legacyHeaders: env.API.RATE_LIMIT.LEGACY_HEADERS,
  }),
);

app.use((req, res, next) => {
  try {
    const access = auth.extractCookie(req);
    const { role } = auth.validateCookie(access);
    if (!auth.authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }
    next();
  } catch (e) {
    console.error(e);
    res.sendStatus(401);
  }
});

app.use("/api/v1", v1);

app.get("/status", (_req, res) => {
  res.send({ status: "running" });
});

server.listen(env.SERVER.PORT, () =>
  console.log(`Logging server running on ${env.SERVER.PORT}`),
);
