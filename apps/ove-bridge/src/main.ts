/* global console */

import { logger } from "./env";
import { initBridge } from "./features/bridge/routes";
import { initHardware } from "./features/hardware/hardware-controller";

const init = async () => {
  await initBridge();
  await initHardware();
};

init()
  .then(() => logger.info("Bridge started"))
  .catch(logger.error);
