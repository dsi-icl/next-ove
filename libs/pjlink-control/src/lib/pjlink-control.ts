import * as net from "net";
import * as crypto from "crypto";
import type { Device, Optional, PJLinkSource } from "@ove/ove-types";
import { replaceAll } from "@ove/ove-utils";
import { z } from "zod";
import { Mutex } from "async-mutex";

/* global Buffer, AbortController */

type PJLinkState = {
  settings: {
    host: string;
    port: number;
    password: string | null;
    timeout: number;
  };
  class: number;
  _connection: net.Socket | null;
  _sessionToken: string | null;
  _curCmd: string | null;
  _callback: ((response: Optional<string>) => void) | null;
  _received: boolean;
};

export const PowerSchema = z
  .object({
    OFF: z.literal(0),
    ON: z.literal(1),
    COOLING_DOWN: z.literal(2),
    WARMING_UP: z.literal(3),
  })
  .strict();

export type Power = z.infer<typeof PowerSchema>;

export const POWER: Power = { OFF: 0, ON: 1, COOLING_DOWN: 2, WARMING_UP: 3 };

export const INPUT: PJLinkSource = {
  RGB: 1,
  VIDEO: 2,
  DIGITAL: 3,
  STORAGE: 4,
  NETWORK: 5,
};

type PJLinkCallback = (response: Optional<string>) => void;

const calcDigest = (rand: string, password: string | null): unknown => {
  const md5 = crypto.createHash("md5");
  md5.setEncoding("hex");
  md5.write(rand);
  if (password !== null) {
    md5.end(password);
  } else {
    md5.end();
  }
  return md5.read();
};

const init = (
  command: string,
  callback: PJLinkCallback,
  timeout: number,
  device?: Device,
  password?: string,
): PJLinkState => {
  return {
    settings: {
      host: device?.host ?? "192.168.1.1",
      port: device?.port ?? 4352,
      password: password ?? null,
      timeout: timeout,
    },
    class: 1,
    _connection: null,
    _sessionToken: null,
    _curCmd: command,
    _callback(response: Optional<string>) {
      this._received = true;
      callback(response);
    },
    _received: false,
  };
};

const disconnect = (state: PJLinkState) => {
  if (!state._received) {
    state._callback?.({ status: "error", error: "Connection closed" });
  }

  if (state._connection) {
    state._connection.removeAllListeners();
    state._connection.end();
  }

  // reset the connection etc
  state._connection = null;
  state._sessionToken = null;
  state._curCmd = null;
  state._callback = null;
  state._received = false;
};

const onError = (state: PJLinkState) => (err: Error) => {
  state._callback?.({ status: "error", error: err.message });
};

const onClose = (state: PJLinkState) => () => {
  disconnect(state);
};

const onTimeout = (state: PJLinkState) => () => {
  state._callback?.({ status: "error", error: "Connection timeout" });
  disconnect(state);
};

const REGEX = {
  AUTH_REGEX: /^PJLINK 1 (.*)\r$/,
  SUCCESS_REGEX: /^%.*=OK\r$/,
  GET_REGEX: /^%.*=\b(?!ERR1|ERR2|ERR3|ERR4|ERRA)\b(.*)\r$/,
  AUTH_ERROR_REGEX: /^PJLINK ERRA\r$/,
  UC_ERROR_REGEX: /^%.*=ERR1\r$/,
  OOP_ERROR_REGEX: /^%.*=ERR2\r$/,
  UT_ERROR_REGEX: /^%.*=ERR3\r$/,
  PDF_ERROR_REGEX: /^%.*=ERR4\r$/,
};

const onData = (state: PJLinkState) => (buffer: Buffer) => {
  const response = buffer.toString("ascii");

  if (state._callback === null || state._connection === null) {
    throw new Error("Callback cannot be null");
  }

  if (REGEX.AUTH_REGEX.test(response)) {
    const sessionToken = REGEX.AUTH_REGEX.exec(response)?.pop();

    if (sessionToken === undefined) {
      throw new Error("Session token cannot be undefined");
    }

    const digest = calcDigest(sessionToken, state.settings.password);
    const message = `${digest}%${state.class}${state._curCmd}\r`;

    state._connection?.write(message);
  } else if (REGEX.SUCCESS_REGEX.test(response)) {
    state._callback?.({ status: "success", data: response });
  } else if (REGEX.GET_REGEX.test(response)) {
    const res = REGEX.GET_REGEX.exec(response)?.pop();
    if (res === undefined) throw new Error("Result cannot be undefined");
    state._callback?.({ status: "success", data: res });
  } else if (REGEX.AUTH_ERROR_REGEX.test(response)) {
    state._callback?.({ status: "error", error: "Incorrect password" });
  } else if (REGEX.UC_ERROR_REGEX.test(response)) {
    state._callback?.({ status: "error", error: "Undefined command" });
  } else if (REGEX.OOP_ERROR_REGEX.test(response)) {
    state._callback?.({ status: "error", error: "Out of parameter" });
  } else if (REGEX.UT_ERROR_REGEX.test(response)) {
    state._callback?.({ status: "error", error: "Unavailable time" });
  } else if (REGEX.PDF_ERROR_REGEX.test(response)) {
    state._callback?.({ status: "error", error: "Projector/Display failure" });
  } else {
    state._callback?.({
      status: "error",
      error: `Unknown response: ${response}`,
    });
  }
};

const connect = (state: PJLinkState, ac?: AbortController) => {
  state._connection = net.connect({
    host: state.settings.host,
    port: state.settings.port,
    signal: ac?.signal,
    timeout: state.settings.timeout,
    noDelay: true,
  });

  state._connection.on("data", onData(state));
  state._connection.on("error", onError(state));
  state._connection.on("close", onClose(state));
  state._connection.on("timeout", onTimeout(state));
};

export const COMMAND = {
  SET_POWER: "%1POWR=$1\r",
  GET_POWER: "%1POWR ?\r",
  SET_INPUT: "%1INPT=$1$2\r",
  GET_INPUT: "%1INPT ?\r",
  MUTE_VIDEO: "%1AVMT=11\r",
  UNMUTE_VIDEO: "%1AVMT=10\r",
  MUTE_AUDIO: "%1AVMT=21\r",
  UNMUTE_AUDIO: "%1AVMT=20\r",
  MUTE: "%1AVMT=31\r",
  UNMUTE: "%1AVMT=30\r",
  GET_IS_MUTED: "%1AVMT ?\r",
  GET_ERRORS: "%1ERST ?\r",
  GET_LAMP: "%1LAMP ?\r",
  GET_INPUTS: "%1INST ?\r",
  GET_NAME: "%1NAME ?\r",
  GET_MANUFACTURER: "%1INF1 ?\r",
  GET_PRODUCT: "%1INF2 ?\r",
  GET_INFO: "%1INFO ?\r",
  GET_CLASS: "%1CLSS ?\r",
};

type CommandArgs = {
  timeout: number;
  device: Device;
  ac?: AbortController;
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
  command: string,
  cmd: CommandArgs,
  ...args: string[]
) => getLock(deviceId).runExclusive(() => runCommand(command, cmd, ...args));

const runCommand = (command: string, cmd: CommandArgs, ...args: string[]) =>
  new Promise<Optional<string>>((resolve) => {
    if (args.length > 0) {
      command = replaceAll(command, args);
    }

    const state = init(
      command,
      (response: Optional<string>) => resolve(response),
      cmd.timeout,
      cmd.device,
    );
    connect(state, cmd.ac);
  });

export const setPower = async (deviceId: string, args: CommandArgs, power: number) => {
  const res = await sendCommandLocked(deviceId, COMMAND.SET_POWER, args, power.toString());
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getPower = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_POWER, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const setInput = async (
  deviceId: string,
  args: CommandArgs,
  input: number,
  channel?: number,
) => {
  const res = await sendCommandLocked(
    deviceId,
    COMMAND.SET_INPUT,
    args,
    input.toString(),
    (channel ?? 1).toString(),
  );
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getInput = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_INPUT, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const muteVideo = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.MUTE_VIDEO, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const unmuteVideo = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.UNMUTE_VIDEO, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const muteAudio = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.MUTE_AUDIO, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const unmuteAudio = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.UNMUTE_AUDIO, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const mute = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.MUTE, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const unmute = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.UNMUTE, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getIsMuted = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_IS_MUTED, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data.split("=")[1] === "31";
};

export const getIsAudioMuted = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_IS_MUTED, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data.split("=")[1] === "21";
};

export const getIsVideoMuted = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_IS_MUTED, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data.split("=")[1] === "11";
};

export const getErrors = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_ERRORS, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getLamp = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_LAMP, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getInputs = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_INPUTS, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getName = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_NAME, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getManufacturer = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_MANUFACTURER, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getProduct = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_PRODUCT, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

export const getInfo = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_INFO, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};

// Returns "1" | "2"
export const getClass = async (deviceId: string, args: CommandArgs) => {
  const res = await sendCommandLocked(deviceId, COMMAND.GET_CLASS, args);
  if (res.status === "error") throw new Error(res.error);
  return res.data;
};
