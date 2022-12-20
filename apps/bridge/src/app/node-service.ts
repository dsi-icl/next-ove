import axios from "axios";
import { wake } from "../utils/wol";
import { DeviceResult, DeviceService } from "../utils/types";

const deviceProtocol = "http";

const reboot = async (ip: string, port: number): Promise<DeviceResult> => (await axios.post(`${deviceProtocol}://${ip}:${port}/reboot`)).data;

const shutdown = async (ip: string, port: number): Promise<DeviceResult> => (await axios.post(`${deviceProtocol}://${ip}:${port}/shutdown`)).data;

const start = async (ip: string, port: number, mac: string): Promise<DeviceResult> => wake(mac, { address: ip });

const info = async (query: string, ip: string, port: number): Promise<DeviceResult> => (await axios.get(`${deviceProtocol}://${ip}:${port}/info?type=${query}`)).data;

const status = async (ip: string, port: number): Promise<DeviceResult> => (await axios.get(`${deviceProtocol}://${ip}:${port}/status`)).data;

const execute = async (command: string, ip: string, port: number): Promise<DeviceResult> => (await axios.post(`${deviceProtocol}://${ip}:${port}/execute`, {command: command})).data;

const screenshot = async (method: string, format: string, screens: string[], ip: string, port: number): Promise<DeviceResult> => (await axios.post(`${deviceProtocol}://${ip}:${port}/screenshot?method=${method}&format=${format}`, {screens: screens})).data;

const openBrowser = async (ip: string, port: number): Promise<DeviceResult> => (await axios.post(`${deviceProtocol}://${ip}:${port}/browser`)).data;

const getBrowserStatus = async (ip: string, port: number): Promise<DeviceResult> => (await axios.post(`${deviceProtocol}://${ip}:${port}/browser`)).data;

const closeBrowser = async (ip: string, port: number): Promise<DeviceResult> => (await axios.delete(`${deviceProtocol}://${ip}:${port}/browser`)).data;

const NodeService: DeviceService = {
  reboot,
  shutdown,
  start,
  info,
  status,
  execute,
  screenshot,
  openBrowser,
  getBrowserStatus,
  closeBrowser
};

export default NodeService;


