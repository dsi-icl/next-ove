const express = require('express');
const bodyParser = require('body-parser');
const { parse } = require('date-fns');
const db = require('../db.js');

const router = express.Router();

router.get('/status', (_req, res) => res.send({status: "running"}));

router.post('/ingest', bodyParser.text(), async (req, res) => {
  const regex = /^ ?(.{4,5}) (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}) - ([^ ]*) *: (.*)$/;
  const data = regex.exec(req.body);
  await db.log.create({
    data: {
      level: data[1].trim(),
      date: parse(data[2].trim(), 'dd/MM/yyyy, HH:mm:ss', new Date()),
      appId: data[3].trim(),
      message: data.slice(4).join(" ")
    },
  });
  res.sendStatus(200);
});

router.get('/logs/:offset', async (req, res) => {
  const levels = req.query?.levels !== undefined ? JSON.parse(req.query.levels) : null;
  const appIds = req.query?.appIds !== undefined ? JSON.parse(req.query.appIds) : null;
  const keywords = req.query?.keywords !== undefined ? JSON.parse(req.query.keywords) : null;
  const dates = req.query?.dates !== undefined ? JSON.parse(req.query.dates) : null;
  const dbDates = dates?.map(({start, end}) => ({date: {lte: end === undefined ? undefined : new Date(Date.parse(end)), gte: start === undefined ? undefined : new Date(Date.parse(start))}})) ?? [];
  const dbKeywords = keywords?.map(keyword => ({message: {contains: keyword}})) ?? [];
  const logs = await db.log.findMany({
    where: {
      level: levels === null ? undefined : { in: levels },
      AND: [{ OR: dbDates }, { OR: dbKeywords }],
      appId: appIds === null ? undefined : {in: appIds},
    },
    skip: parseInt(req.params.offset),
    take: parseInt(process.env.PAGE_SIZE)
  });
  res.send(logs);
});

module.exports = router;
