import axios from "axios";
import { wake } from "../utils/wol";
import { DeviceResult, DeviceService } from "../utils/types";

const deviceProtocol = "http";

const reboot = async (ip: string, port: number): Promise<DeviceResult> => (await axios.post(`${deviceProtocol}://${ip}:${port}/reboot`)).data;

const shutdown = async (ip: string, port: number): Promise<DeviceResult> => (await axios.post(`${deviceProtocol}://${ip}:${port}/shutdown`)).data;

const start = async (ip: string, port: number, mac: string): Promise<DeviceResult> => wake(mac, { address: ip });

const NodeService: DeviceService = {
  reboot,
  shutdown,
  start
};

export default NodeService;


