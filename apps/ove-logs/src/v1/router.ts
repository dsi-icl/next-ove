import express, { type Request } from "express";
import bodyParser from "body-parser";
import { parse } from "date-fns";
import { io as IOServer, signingKey } from "../app";
import { db } from "../db";
import stripAnsi from "strip-ansi";
import { Json } from "@ove/ove-utils";
import { env } from "../env";
import { thirdPartyCookieMiddleware } from "@ove/ove-auth";
import { authorize } from "../auth";

let appIds = new Set<string>();
let identifiers = new Set<string>();

const extractParams = (req: Request) => {
  const dates =
    req.query.dates !== undefined
      ? Json.parse<{ start: string; end: string }[]>(req.query.dates as string)
      : undefined;
  const keywords =
    req.query.keywords !== undefined
      ? Json.parse<string[]>(req.query.keywords as string)
      : undefined;
  const levels =
    req.query.levels !== undefined
      ? Json.parse<string[]>(req.query.levels as string)
      : undefined;
  const appIds =
    req.query.appIds !== undefined
      ? Json.parse<string[]>(req.query.appIds as string)
      : undefined;
  const identifiers =
    req.query.identifiers !== undefined
      ? Json.parse<string[]>(req.query.identifiers as string)
      : undefined;
  const sorting =
    req.query.sorting !== undefined
      ? Json.parse<
          {
            [key: string]: "asc" | "desc";
          }[]
        >(req.query.sorting as string)
      : undefined;
  const dbDates =
    dates?.map(({ start, end }) => ({
      date: {
        lte: end === null ? undefined : new Date(Date.parse(end)),
        gte: start === null ? undefined : new Date(Date.parse(start)),
      },
    })) ?? [];
  const dbKeywords =
    keywords?.map((keyword) => ({ message: { contains: keyword } })) ?? [];
  return {
    dates: dbDates,
    keywords: dbKeywords,
    appIds,
    identifiers,
    levels,
    sorting,
  };
};

const safe = async (fn: () => Promise<void>, onError: () => void) => {
  try {
    await fn();
  } catch (e) {
    console.error(e);
    onError();
  }
};

db.log
  .findMany({
    distinct: ["appId"],
    select: {
      appId: true,
    },
  })
  .then((ids) => ids.forEach((id) => appIds.add(id.appId)))
  .catch(console.error);

db.log
  .findMany({
    distinct: ["identifier"],
    select: {
      identifier: true,
    },
  })
  .then((ids) => ids.forEach((id) => identifiers.add(id.identifier)))
  .catch(console.error);

// eslint-disable-next-line new-cap
const router = express.Router();

const io = IOServer.of("/v1");

router.get("/status", (_req, res) => {
  res.send({ status: "running" });
});

router.post("/ingest", bodyParser.text(), async (req, res) => {
  safe(
    async () => {
      // eslint-disable-next-line max-len
      const regex =
        /^ ?(.{6,7}) (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}) - ([^ ]*) * - ([^ ]*) *: ((?:.|\n)*)$/;
      const raw = regex.exec(stripAnsi(req.body))!;
      const data = {
        level: raw[1].trim().slice(1, -1).toLowerCase(),
        date: parse(raw[2].trim(), "dd/MM/yyyy, HH:mm:ss", new Date()),
        appId: raw[3].trim(),
        identifier: raw[4].trim(),
        message: raw[5].trim(),
      };
      if (!appIds.has(data.appId)) {
        appIds.add(data.appId);
      }
      if (!identifiers.has(data.identifier)) {
        identifiers.add(data.identifier);
      }
      const { id } = await db.log.create({ data });
      io.emit("log", { ...data, id });
      res.sendStatus(200);
    },
    () => {
      if (res.closed) return;
      res.sendStatus(500);
    },
  ).catch(() => {
    if (res.closed) return;
    res.sendStatus(500);
  });
});

router.use((req, res, next) =>
  thirdPartyCookieMiddleware(
    req,
    res,
    next,
    {
      signingKey,
      audience: env.APP_NAME,
      algorithm: env.AUTH?.JWT_ALGORITHMS,
      cookieId: env.AUTH?.COOKIE_ID ?? "next-ove",
    },
    authorize,
  ),
);

router.get("/logs/app-ids", async (_req, res) => {
  safe(
    async () => {
      res.send(Array.from(appIds));
    },
    () => {
      if (res.closed) return;
      res.sendStatus(500);
    },
  ).catch(() => {
    if (res.closed) return;
    res.sendStatus(500);
  });
});

router.get("/logs/identifiers", async (_req, res) => {
  safe(
    async () => {
      res.send(Array.from(identifiers));
    },
    () => {
      if (res.closed) return;
      res.sendStatus(500);
    },
  ).catch(() => {
    if (res.closed) return;
    res.sendStatus(500);
  });
});

router.get("/logs/:offset", async (req, res) => {
  safe(
    async () => {
      const { levels, dates, keywords, sorting, appIds, identifiers } = extractParams(req);
      const logs = await db.log.findMany({
        where: {
          level: levels === undefined ? undefined : { in: levels },
          AND: [{ OR: dates }, { OR: keywords }],
          appId: appIds === undefined ? undefined : { in: appIds },
          identifier: identifiers === undefined ? undefined : { in: identifiers },
        },
        orderBy: sorting,
        skip: parseInt(req.params.offset) * env.API.PAGE_SIZE,
        take: env.API.PAGE_SIZE,
      });
      res.send(logs);
    },
    () => {
      if (res.closed) return;
      res.sendStatus(500);
    },
  ).catch(() => {
    if (res.closed) return;
    res.sendStatus(500);
  });
});

router.get("/pages", async (req, res) => {
  safe(
    async () => {
      const { levels, dates, keywords, appIds, identifiers } = extractParams(req);
      const count = await db.log.count({
        where: {
          level: levels === undefined ? undefined : { in: levels },
          AND: [{ OR: dates }, { OR: keywords }],
          appId: appIds === undefined ? undefined : { in: appIds },
          identifier: identifiers === undefined ? undefined : { in: identifiers },
        },
      });
      res.send({
        pageCount: Math.ceil(count / env.API.PAGE_SIZE),
        pageSize: env.API.PAGE_SIZE,
      });
    },
    () => {
      if (res.closed) return;
      res.sendStatus(500);
    },
  ).catch(() => {
    if (res.closed) return;
    res.sendStatus(500);
  });
});

export default router;
