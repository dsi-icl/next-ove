/* global AbortController, setTimeout */

import { Socket } from "net";
import { Mutex } from "async-mutex";
import { assert } from "@ove/ove-utils";
import { type MDCInfo, type MDCSource } from "@ove/ove-types";

const MDC_PORT = 1515;

export const sources: MDCSource = {
  UNKNOWN: 0x00,
  PC: 0x14,
  DVI: 0x18,
  DVI_VIDEO: 0x1f,
  AV: 0x0c,
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
  DP3: 0x27,
} as const;

type MDCSourceVal = MDCSource[keyof MDCSource];

type CommandArgs = {
  ac?: AbortController;
  id: number;
  host: string;
  port?: number;
  timeout: number;
};

const deviceLocks = new Map<string, Mutex>();

const getLock = (id: string) => {
  let lock = deviceLocks.get(id);
  if (!lock) {
    lock = new Mutex();
    deviceLocks.set(id, lock);
  }
  return lock;
};

const sendCommandLocked = (
  deviceId: string,
  commandId: number,
  cmdArgs: CommandArgs,
  ...args: number[]
) =>
  getLock(deviceId).runExclusive(
    () =>
      new Promise<Uint8Array>((resolve, reject) => {
        sendCommand(resolve, reject, commandId, cmdArgs, ...args);
      }),
  );

const sendCommand = (
  resolve: (obj: Uint8Array) => void,
  reject: (reason: string) => void,
  commandId: number,
  cmdArgs: CommandArgs,
  ...args: number[]
) => {
  const socket = new Socket({ signal: cmdArgs.ac?.signal });
  socket.setTimeout(cmdArgs.timeout);

  socket.on("timeout", () => {
    socket.end(() => reject("TIMEOUT"));
  });

  socket.on("error", (err) => {
    socket.end(() => reject(err.message));
  });

  socket.on("data", (data) => {
    const args = new Uint8Array(data);
    const status = args.at(4);
    socket.end(() => {
      if (status === 0x41) {
        resolve(args);
      } else {
        reject(`Received error: ${args.at(6)}`);
      }
    });
  });

  setTimeout(() => {
    socket.end(() => reject("TIMEOUT"));
  }, cmdArgs.timeout);

  socket.connect(cmdArgs.port ?? MDC_PORT, cmdArgs.host, () => {
    const command = [0xaa, commandId, cmdArgs.id, args.length].concat(args);
    const checksum = command.slice(1).reduce((acc, x) => acc + x, 0) % 256;
    command.push(checksum);
    socket.write(new Uint8Array(command), (err) => {
      if (err) {
        socket.end(() => reject(err.message));
      }
    });
  });
};

export const getStatus = async (deviceId: string, args: CommandArgs): Promise<"on" | "off"> => {
  const status = await sendCommandLocked(deviceId, 0x11, args);
  if (status.at(6) === undefined || status[6] > 0x01)
    throw new Error("Couldn't get status");
  return status.at(6) === 0x00 ? "off" : "on";
};

export const setPower = async (
  deviceId: string,
  args: CommandArgs,
  state: "on" | "off" | "reboot",
): Promise<boolean> => {
  const powerState = state === "off" ? 0x00 : state === "on" ? 0x01 : 0x02;
  const res = await sendCommandLocked(deviceId, 0x11, args, powerState);
  return res.at(6) === powerState;
};

export const setVolume = async (
  deviceId: string,
  args: CommandArgs,
  volume: number,
): Promise<boolean> => {
  const res = await sendCommandLocked(deviceId, 0x12, args, volume);
  return res.at(6) === volume;
};

export const setIsMute = async (
  deviceId: string,
  args: CommandArgs,
  state: boolean,
): Promise<boolean> => {
  const res = await sendCommandLocked(deviceId, 0x13, args, state ? 0x01 : 0x00);
  return res.at(6) === (state ? 0x01 : 0x00);
};

export const setSource = async (
  deviceId: string,
  args: CommandArgs,
  source: MDCSourceVal,
): Promise<boolean> => {
  const res = await sendCommandLocked(deviceId, 0x14, args, source);
  return res.at(6) === source;
};

export const getInfo = async (deviceId: string, args: CommandArgs): Promise<MDCInfo> => {
  const res = await sendCommandLocked(deviceId, 0x00, args);
  if (res.length < 10) throw new Error("Incorrect result");

  return {
    power: res[6] === 0x00 ? "off" : "on",
    volume: res[7],
    isMuted: res[8] !== 0x00,
    source: assert(
      Object.entries(sources)
        .find(([_k, v]) => v === res[9])
        ?.at(0),
    ) as keyof MDCSource,
  };
};
