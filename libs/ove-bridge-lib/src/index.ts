export { env, initEnv } from "./lib/environments/env";
export { default as fileSetup } from "./lib/environments/setup";
export {
  initHardware,
  closeHardwareSocket,
  registerSocketConnectedListener,
  registerSocketDisconnectListener,
  getSocketStatus
} from "./lib/features/hardware/hardware-controller";