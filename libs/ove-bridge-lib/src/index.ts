export {
  initHardware,
  closeHardwareSocket,
  registerSocketConnectedListener,
  registerSocketDisconnectListener,
  getSocketStatus
} from "./lib/features/hardware/hardware-controller";
export { createClient } from "./lib/features/hardware/node-service";