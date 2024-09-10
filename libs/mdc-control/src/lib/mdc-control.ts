/* global setTimeout */

import { Socket } from "net";
import { raise } from "@ove/ove-utils";
import { isError, MDCSources, OVEException } from "@ove/ove-types";

const MDC_PORT = 1515;

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

type CommandArgs = {
  ac?: AbortController
  id: number
  ip: string
  port?: number
  timeout: number
}

const sendCommand = (
  resolve: (obj: Uint8Array | OVEException) => void,
  commandId: number,
  cmdArgs: CommandArgs,
  ...args: number[]
) => {
  const socket = new Socket({signal: cmdArgs.ac?.signal});
  socket.setTimeout(cmdArgs.timeout);

  socket.on("timeout", () => {
    socket.end(() => resolve(raise("Timeout")));
  });

  socket.on("error", err => {
    socket.end(() => resolve(raise(err.message)));
  });

  socket.on("data", data => {
    const args = new Uint8Array(data);
    const status = args.at(4);
    socket.end(() => {
      if (status === 0x41) {
        resolve(args);
      } else {
        resolve(raise(`Received error: ${args.at(6)}`));
      }
    });
  });

  setTimeout(() => {
    socket.end(() => resolve(raise("TIMEOUT")));
  }, cmdArgs.timeout);

  socket.connect(cmdArgs.port ?? MDC_PORT, cmdArgs.ip, () => {
    const command = [0xAA, commandId, cmdArgs.id, args.length].concat(args);
    const checksum = command.slice(1).reduce((acc, x) => acc + x, 0) % 256;
    command.push(checksum);
    socket.write(new Uint8Array(command), err => {
      if (err) {
        socket.end(() => resolve(raise(err.message)));
      }
    });
  });
};

export const getStatus = async (args: CommandArgs):
  Promise<"on" | "off" | OVEException> => {
  const status =
    await new Promise<Uint8Array | OVEException>(resolve =>
      sendCommand(resolve, 0x11, args));
  if (isError(status)) return status;
  return "on";
};

export const setPower = async (
  args: CommandArgs,
  state: "on" | "off" | "reboot",
): Promise<boolean | OVEException> => {
  const powerState = state === "off" ? 0x00 : (state === "on" ? 0x01 : 0x02);
  const res = await new Promise<Uint8Array | OVEException>(resolve =>
    sendCommand(resolve, 0x11, args, powerState));
  if (isError(res)) return res;
  return res.at(6) === powerState;
};

export const setVolume = async (
  args: CommandArgs,
  volume: number,
): Promise<boolean | OVEException> => {
  const res = await new Promise<Uint8Array | OVEException>(resolve =>
    sendCommand(resolve, 0x12, args, volume));
  if (isError(res)) return res;
  return res.at(6) === volume;
};

export const setIsMute = async (
  args: CommandArgs,
  state: boolean,
): Promise<boolean | OVEException> => {
  const res = await new Promise<Uint8Array | OVEException>(resolve =>
    sendCommand(resolve, 0x13, args, state ? 0x01 : 0x00));
  if (isError(res)) return res;
  return res.at(6) === (state ? 0x01 : 0x00);
};

export const setSource = async (
  args: CommandArgs,
  source: MDCSource,
): Promise<boolean | OVEException> => {
  const res = await new Promise<Uint8Array | OVEException>(resolve =>
    sendCommand(resolve, 0x14, args, source));
  if (isError(res)) return res;
  return res.at(6) === source;
};

export const getInfo = async (
  args: CommandArgs
): Promise<{
  power: "off" | "on",
  volume: number,
  isMuted: boolean,
  source: MDCSource
} | OVEException> => {
  const res = await new Promise<Uint8Array | OVEException>(resolve =>
    sendCommand(resolve, 0x00, args));
  if (isError(res)) return res;
  if (res.length < 10) return raise("Incorrect result");

  return {
    power: res[6] === 0x00 ? "off" : "on",
    volume: res[7],
    isMuted: res[8] !== 0x00,
    source: res[9]
  };
};
