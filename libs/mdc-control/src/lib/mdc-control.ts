/* global setTimeout */

import { io } from "socket.io-client";
import { type MDCSources, type OVEException } from "@ove/ove-types";
import { raise } from "@ove/ove-utils";

export const sources: MDCSources = {
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
} as const;

type MDCSource = MDCSources[keyof MDCSources];

const sendCommand = (
  resolve: (obj: string | OVEException) => void,
  id: number,
  ip: string,
  port: number | undefined,
  protocol: string | undefined,
  commandId: number,
  timeout: number,
  ...args: number[]
) => {
  const socketPort = port === undefined ? "" : `:${port}`;
  const socket = io(`${protocol ?? "ws"}://${ip}${socketPort}`);

  setTimeout(() => {
    socket.disconnect();
    resolve(raise("MDC TIMEOUT"));
  }, timeout);

  socket.on("connect", () => {
    const command = [0xAA, commandId, id, args.length].concat(args);
    const checksum = command.slice(1).reduce((acc, x) => acc + x, 0) % 256;
    command.push(checksum);
    socket.send(command);
    socket.onAny((_name, message) => {
      if (typeof message === "string") {
        resolve(message);
      } else {
        resolve(JSON.stringify(message));
      }
      socket.disconnect();
    });
  });
};

export const getStatus = (
  timeout: number,
  id: number,
  ip: string,
  port?: number,
  protocol?: string,
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x00, timeout));

export const setPower = (
  state: "on" | "off",
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x11, state === "off" ? 0 : 1));

export const getPower = (
  timeout: number,
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x11, timeout));

export const setVolume = (
  volume: number,
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x12, volume));

export const getVolume = (
  timeout: number,
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x12, timeout));

export const setIsMute = (
  state: boolean,
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x13, +state));

export const getIsMute = (
  timeout: number,
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x13, timeout));

export const setSource = (
  source: MDCSource,
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x14, source));

export const getSource = (
  timeout: number,
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x14, timeout));

export const getModel = (
  timeout: number,
  id: number,
  ip: string,
  port?: number,
  protocol?: string
): Promise<string | OVEException> => new Promise(resolve =>
  sendCommand(resolve, id, ip, port, protocol, 0x10, timeout));
