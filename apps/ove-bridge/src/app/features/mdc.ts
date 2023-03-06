import { io } from "socket.io-client";
import { MDCSource } from "../../utils/types";

export const sources: MDCSource = {
  UNKNOWN: 0x00,
  PC: 0x14,
  DVI: 0x18,
  DVI_VIDEO: 0x1F,
  AV: 0x0C,
  SVIDEO: 0x04,
  COMPONENT: 0x08,
  MAGICNET: 0x20,
  TV: 0x30,
  DTV: 0x40,
  HDMI1: 0x21,
  HDMI1_PC: 0x22,
  HDMI2: 0x23,
  HDMI2_PC: 0x24,
  DP: 0x25,
  DP2: 0x26,
  DP3: 0x27
};

const sendCommand = (resolve: (obj: string) => void, id: number, ip: string, port: number, command_id: number, ...args: number[]) => {
  const socket = io(`ws://${ip}:${port}`);
  const command = [0xAA, command_id, id, args.length].concat(args);
  const checksum = command.slice(1).reduce((acc, x) => acc + x, 0) % 256;
  command.push(checksum);
  socket.send(command);
  socket.onAny(m => {
    resolve(JSON.stringify(m));
  });
};

export const getStatus = (id: number, ip: string, port: number) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x00));
};

export const setPower = (id: number, ip: string, port: number, state: string) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x11, state === "off" ? 0 : 1));
};

export const getPower = (id: number, ip: string, port: number) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x11));
};

export const setVolume = (id: number, ip: string, port: number, volume: number) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x12, volume));
};

export const getVolume = (id: number, ip: string, port: number) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x12));
};

export const setIsMute = (id: number, ip: string, port: number, state: boolean) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x13, +state));
};

export const getIsMute = (id: number, ip: string, port: number) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x13));
};

export const setSource = (id: number, ip: string, port: number, source: keyof MDCSource) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x14, sources[source]));
};

export const getSource = (id: number, ip: string, port: number) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x14));
};

export const getModel = (id: number, ip: string, port: number) => {
  return new Promise<string>(resolve => sendCommand(resolve, id, ip, port, 0x10));
};
