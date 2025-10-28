import http from "node:http";
import { env, logger } from "./env";
import client from "prom-client";
import { initBridge } from "./features/bridge/routes";
import { initHardware } from "./features/hardware/hardware-controller";

const init = async () => {
  await initBridge();
  await initHardware();

  client.collectDefaultMetrics();

  http.createServer(async (req, res) => {
    if (req.url === '/ove-bridge/metrics') {
      res.setHeader('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    } else {
      res.writeHead(404); res.end();
    }
  }).listen(env.METRICS.PORT, env.METRICS.HOST);
};

init()
  .then(() => logger.info("Bridge started"))
  .catch(logger.error);
