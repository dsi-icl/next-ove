import { DeviceResult, DeviceService } from "../utils/types";

const reboot = async (ip: string, port: number): Promise<DeviceResult> => {
  // TODO: implement
  throw new Error("Not Implemented");
};

const shutdown = async (ip: string, port: number): Promise<DeviceResult> => {
  // TODO: implement
  throw new Error("Not Implemented");
};

const start = async (ip: string, port: number, mac: string): Promise<DeviceResult> => {
  // TODO: implement
  throw new Error("Not Implemented");
};

const ProjectorService: DeviceService = {
  reboot,
  shutdown,
  start
};

export default ProjectorService;
