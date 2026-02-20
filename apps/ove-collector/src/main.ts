/* global console */

import cors from "cors";
import { z } from "zod";
import express from "express";
import rateLimit from "express-rate-limit";

import { env } from "./env";
import { eventBuffer } from "./buffer";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use(cors({ origin: "*" }));

app.use(
  "/capture",
  rateLimit({
    windowMs: env.API.RATE_LIMIT.WINDOW_MS,
    limit: env.API.RATE_LIMIT.LIMIT,
    standardHeaders: env.API.RATE_LIMIT.STANDARD_HEADERS,
    legacyHeaders: env.API.RATE_LIMIT.LEGACY_HEADERS,
  }),
);

const analyticsSchema = z.object({
  event: z.string().min(1),
  timestamp: z.string(),
  anonymous_id: z.string().optional(),
  user_id: z.string().optional(),
  properties: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
  type: z.literal("analytics"),
});

const logSchema = z.object({
  timestamp: z.string(),
  source: z.string(),
  service: z.string(),
  level: z.string(),
  trace_id: z.string().optional(),
  span_id: z.string().optional(),
  message: z.string(),
  host: z.string().optional(),
  attributes: z.record(z.any()).optional(),
  type: z.literal("log"),
});

const captureSchema = z.object({
  api_key: z.string(),
  events: z
    .array(z.discriminatedUnion("type", [analyticsSchema, logSchema]))
    .min(1)
    .max(env.API.RATE_LIMIT.MAX_EVENTS_PER_REQUEST),
});

app.post("/capture", async (req, res) => {
  const parsed = captureSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const { api_key: apiKey, events } = parsed.data;

  const project = env.PROJECTS.find((project) => project.publicKey === apiKey);

  if (!project) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  const enrichAnalytics = (e: z.infer<typeof analyticsSchema>) => ({
    type: "analytics" as const,
    data: {
      timestamp: new Date(e.timestamp),
      project_id: project.projectId,
      event: e.event,
      anonymous_id: e.anonymous_id ?? "",
      user_id: e.user_id ?? "",
      url: e.context?.url ?? "",
      path: e.context?.path ?? "",
      user_agent: e.context?.user_agent ?? "",
      referrer: e.context?.referrer ?? "",
      ip: req.ip,
      properties: Object.fromEntries(
        Object.entries(e.properties ?? {}).map(([k, v]) => [k, String(v)]),
      ),
    },
  });

  const enrichLogs = (e: z.infer<typeof logSchema>) => ({
    type: "log" as const,
    data: {
      level: e.level,
      message: e.message,
    },
  });

  const enriched = events.map((e) =>
    e.type === "analytics" ? enrichAnalytics(e) : enrichLogs(e),
  );

  await eventBuffer.add(enriched);

  res.status(204).end();
});

app.get("/", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(env.SERVER.PORT, () => {
  console.log(`Analytics collector running on :${env.SERVER.PORT}`);
});
