const express = require("express");
const bodyParser = require("body-parser");
const { parse } = require("date-fns");
const { io: IOServer } = require("../app.js");
const { db } = require("../db.js");
const stripAnsi = require("strip-ansi");
const jwt = require("jsonwebtoken");
const nanoid = require("nanoid").nanoid;

let appIds = new Set();

const safe = async (fn, onError) => {
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

const keyAuthentication = async (req, res, next) => {
  safe(
    async () => {
      const [type, key] = req.headers?.["authorization"]?.split(" ");
      if (type !== "Bearer") res.sendStatus(401);
      const result = await db.key.findUnique({
        where: {
          key,
        },
      });
      if (result === null) {
        jwt.verify(key, process.env.JWT_SECRET, (err) => {
          if (err) res.sendStatus(401);
          else next();
        });
      } else {
        next();
      }
    },
    () => res.sendStatus(401),
  );
};

const tokenAuthentication = async (socket, next) => {
  const token = socket.handshake?.auth?.token;
  if (token === undefined) next(new Error("401: UNAUTHORIZED"));
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return next(new Error("401: UNAUTHORIZED"));
    next();
  });
};

// eslint-disable-next-line new-cap
const router = express.Router();

const io = IOServer.of("/v1");

io.use(tokenAuthentication);

router.get("/status", (_req, res) => void res.send({ status: "running" }));

router.post("/ingest", bodyParser.text(), async (req, res) => {
  safe(
    async () => {
      // eslint-disable-next-line max-len
      const regex =
        /^ ?(.{6,7}) (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}) - ([^ ]*) *: ((?:.|\n)*)$/;
      const raw = regex.exec(stripAnsi(req.body));
      const data = {
        level: raw[1].trim().slice(1, -1).toLowerCase(),
        date: parse(raw[2].trim(), "dd/MM/yyyy, HH:mm:ss", new Date()),
        appId: raw[3].trim(),
        message: raw[4].trim(),
      };
      if (!appIds.has(data.appId)) {
        appIds.add(data.appId);
      }
      const { id } = await db.log.create({ data });
      io.emit("log", { ...data, id });
      res.sendStatus(200);
    },
    () => res.sendStatus(500),
  );
});

router.get("/logs/app-ids", keyAuthentication, async (req, res) => {
  safe(
    () => res.send(Array.from(appIds)),
    () => res.sendStatus(500),
  );
});

router.get("/logs/:offset", keyAuthentication, async (req, res) => {
  safe(
    async () => {
      const dates =
        req.query.dates !== undefined ? JSON.parse(req.query.dates) : undefined;
      const keywords =
        req.query.keywords !== undefined
          ? JSON.parse(req.query.keywords)
          : undefined;
      const levels =
        req.query.levels !== undefined
          ? JSON.parse(req.query.levels)
          : undefined;
      const appIds =
        req.query.appIds !== undefined
          ? JSON.parse(req.query.appIds)
          : undefined;
      const sorting =
        req.query.sorting !== undefined
          ? JSON.parse(req.query.sorting)
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
      const logs = await db.log.findMany({
        where: {
          level: levels === undefined ? undefined : { in: levels },
          AND: [{ OR: dbDates }, { OR: dbKeywords }],
          appId: appIds === undefined ? undefined : { in: appIds },
        },
        orderBy: sorting,
        skip: parseInt(req.params.offset) * process.env.PAGE_SIZE,
        take: parseInt(process.env.PAGE_SIZE),
      });
      res.send(logs);
    },
    () => res.sendStatus(500),
  );
});

router.get("/token", keyAuthentication, async (req, res) => {
  safe(
    () => {
      res.send({
        token: jwt.sign({ id: nanoid() }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        }),
      });
    },
    () => res.sendStatus(500),
  );
});

router.get("/pages", keyAuthentication, async (req, res) => {
  safe(
    async () => {
      const dates =
        req.query.dates !== undefined ? JSON.parse(req.query.dates) : undefined;
      const keywords =
        req.query.keywords !== undefined
          ? JSON.parse(req.query.keywords)
          : undefined;
      const levels =
        req.query.levels !== undefined
          ? JSON.parse(req.query.levels)
          : undefined;
      const appIds =
        req.query.appIds !== undefined
          ? JSON.parse(req.query.appIds)
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
      const count = await db.log.count({
        where: {
          level: levels === undefined ? undefined : { in: levels },
          AND: [{ OR: dbDates }, { OR: dbKeywords }],
          appId: appIds === undefined ? undefined : { in: appIds },
        },
      });
      res.send({
        pageCount: Math.ceil(count / process.env.PAGE_SIZE),
        pageSize: process.env.PAGE_SIZE,
      });
    },
    () => res.sendStatus(500),
  );
});

module.exports = router;
