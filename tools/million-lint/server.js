const z = require('zod').z;
const express = require('express');
const cors = require('cors');
const writeFileSync = require('fs').writeFileSync;
const readFileSync = require('fs').readFileSync;
const path = require('path');

const ConfigSchema = z.strictObject({
  limit: z.string(),
  cors: z.any(),
  port: z.number(),
  version: z.number(),
  host: z.string()
});

const config = ConfigSchema.parse(JSON.parse(
  readFileSync(path.join(__dirname, 'config.json')).toString()));

const runtime = [];
const network = [];
const date = new Date();

const app = express();

app.use(express.json({ limit: config.limit }));

app.use(cors(config.cors));

app.get('/', (req, res) => {
  res.json([
    { version: config.version, cwd: process.cwd(), port: config.port }
  ]);
});

app.post('/ingest', (req, res) => {
  if (req.query.t === 'network') {
    network.push(req.body);
  } else {
    runtime.push(req.body);
  }
  res.json({ ok: true });
});

app.listen(config.port, config.host);

process.on('exit', () => {
  writeFileSync(path.join(
    __dirname,
    'data',
    `runtime-${date.toISOString()}.json`
  ), JSON.stringify(runtime, undefined, 2));
  writeFileSync(path.join(
    __dirname,
    'data',
    `network-${date.toISOString()}.json`
  ), JSON.stringify(network, undefined, 2));
  process.exit();
});