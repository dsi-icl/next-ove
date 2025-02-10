const express = require("express");
const bodyParser = require("body-parser");
const { parse } = require("date-fns");
const { io: IOServer } = require("../app.js");
const { db } = require("../db.js");
const stripAnsi = require("strip-ansi");

// eslint-disable-next-line new-cap
const router = express.Router();
const clients = new Map();

const io = IOServer.of("/v1");

io.on("connection", socket => {
  clients.set(socket.id, {});

  socket.on("logs", async (
    { levels, appIds, keywords, offset, dates, live, sorting }
  ) => {
    const dbDates = dates?.map(({ start, end }) => ({
      date: {
        lte: end === undefined ? undefined : new Date(Date.parse(end)),
        gte: start === undefined ? undefined : new Date(Date.parse(start))
      }
    })) ?? [];
    const dbKeywords = keywords?.map(keyword =>
      ({ message: { contains: keyword } })) ?? [];
    const logs = await db.log.findMany({
      where: {
        level: levels === null ? undefined : { in: levels },
        AND: [{ OR: dbDates }, { OR: dbKeywords }],
        appId: appIds === null ? undefined : { in: appIds },
      },
      orderBy: sorting,
      skip: parseInt(live ? 0 : offset) * process.env.PAGE_SIZE,
      take: parseInt(process.env.PAGE_SIZE)
    });
    clients.get(socket.id, { levels, appIds, keywords, offset, dates, live });
    socket.send("logs", logs);
  });
});

io.on("disconnect", socket => {
  clients.delete(socket.id);
});

const sendLog = ({ level, date, appId, message }) => {
  const fd = new Date(Date.parse(date));
  for (const [k, v] of clients.entries()) {
    if (v.levels !== undefined && !v.levels.includes(level)) continue;
    if (v.appIds !== undefined && !v.appIds.includes(appId)) continue;
    if (v.keywords !== undefined &&
      !v.keywords.some(x => message.includes(x))) continue;
    if (v.dates !== undefined && !v.dates.some(({ start, end }) => {
      if (start !== undefined && new Date(Date.parse(start)) > fd) return false;
      return end === undefined || new Date(Date.parse(end)) >= fd;
    })) continue;
    io.sockets[k].send("log", { level, date, appId, message });
  }
};

router.get("/status", (_req, res) => res.send({ status: "running" }));

router.post("/ingest", bodyParser.text(), async (req, res) => {
  try {
    // eslint-disable-next-line max-len
    const regex = /^ ?(.{6,7}) (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}) - ([^ ]*) *: ((?:.|\n)*)$/;
    const raw = regex.exec(stripAnsi(req.body));
    const data = {
      level: raw[1].trim(),
      date: parse(raw[2].trim(), "dd/MM/yyyy, HH:mm:ss", new Date()),
      appId: raw[3].trim(),
      message: raw[4].trim()
    };
    await db.log.create({ data });
    sendLog(data);
    res.sendStatus(200);
  } catch (_e) {
    res.sendStatus(500);
  }
});

router.get("/logs/:offset", async (req, res) => {
  const logs = await db.log.findMany({
    offset: parseInt(req.params.offset) * process.env.PAGE_SIZE,
    limit: process.env.PAGE_SIZE
  });
  res.send(logs);
});

module.exports = router;
