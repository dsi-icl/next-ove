import * as net from "net";
import * as crypto from "crypto";
import { Device, OVEException, PJLinkSource } from "@ove/ove-types";
import { Utils } from "@ove/ove-utils";
import { z } from "zod";

/* global Buffer, console */

type PJLinkState = {
  settings: {
    host: string,
    port: number,
    password: string | null,
    timeout: number
  }
  class: number
  _connection: net.Socket | null
  _sessionToken: string | null
  _curCmd: string | null
  _callback: ((response: PJLinkResponse) => void) | null
  _received: boolean
};

export const PowerSchema = z.object({
  OFF: z.literal(0),
  ON: z.literal(1),
  COOLING_DOWN: z.literal(2),
  WARMING_UP: z.literal(3)
}).strict();

export type Power = z.infer<typeof PowerSchema>;

export const POWER: Power = { OFF: 0, ON: 1, COOLING_DOWN: 2, WARMING_UP: 3 };

export const INPUT: PJLinkSource = {
  RGB: 1, VIDEO: 2, DIGITAL: 3, STORAGE: 4, NETWORK: 5
};

type PJLinkResponse = OVEException | string;
type PJLinkCallback = (response: PJLinkResponse) => void;

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
  device?: Device,
  password?: string
): PJLinkState => {
  return {
    settings: {
      host: device?.ip || "192.168.1.1",
      port: device?.port || 4352,
      password: password || null,
      timeout: 0
    },
    class: 1,
    _connection: null,
    _sessionToken: null,
    _curCmd: command,
    _callback(response: PJLinkResponse) {
      this._received = true;
      callback(response);
    },
    _received: false
  };
};

const disconnect = (state: PJLinkState) => {
  if (!state._received) {
    state._callback?.({ oveError: "Connection closed" });
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
  state._callback?.({ oveError: err.message });
};

const onClose = (state: PJLinkState) => () => {
  disconnect(state);
};

const onTimeout = (state: PJLinkState) => () => {
  state._callback?.({ oveError: "Connection timeout" });
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
  PDF_ERROR_REGEX: /^%.*=ERR4\r$/
};

const onData = (state: PJLinkState) => (buffer: Buffer) => {
  const response = buffer.toString("ascii");

  if (state._callback === null || state._connection === null) {
    throw new Error("Callback cannot be null");
  }

  if (REGEX.AUTH_REGEX.test(response)) {
    const sessionToken = response.match(REGEX.AUTH_REGEX)?.pop();

    if (sessionToken === undefined) {
      throw new Error("Session token cannot be undefined");
    }

    const digest = calcDigest(sessionToken, state.settings.password);
    const message = `${digest}%${state.class}${state._curCmd}\r`;

    state._connection?.write(message);
  } else if (REGEX.SUCCESS_REGEX.test(response)) {
    state._callback?.(response);
  } else if (REGEX.GET_REGEX.test(response)) {
    const res = response.match(REGEX.GET_REGEX)?.pop();
    if (res === undefined) throw new Error("Result cannot be undefined");
    state._callback?.(res);
  } else if (REGEX.AUTH_ERROR_REGEX.test(response)) {
    state._callback?.({ oveError: "Incorrect password" });
  } else if (REGEX.UC_ERROR_REGEX.test(response)) {
    state._callback?.({ oveError: "Undefined command" });
  } else if (REGEX.OOP_ERROR_REGEX.test(response)) {
    state._callback?.({ oveError: "Out of parameter" });
  } else if (REGEX.UT_ERROR_REGEX.test(response)) {
    state._callback?.({ oveError: "Unavailable time" });
  } else if (REGEX.PDF_ERROR_REGEX.test(response)) {
    state._callback?.({ oveError: "Projector/Display failure" });
  } else {
    state._callback?.({ oveError: `Unknown response: ${response}` });
  }
};

const connect = (state: PJLinkState) => {
  state._connection = net.connect({
    port: state.settings.port,
    host: state.settings.host
  }, () => console.log("Connected"));

  state._connection.on("data", onData(state));
  state._connection.on("error", onError(state));
  state._connection.on("close", onClose(state));
  state._connection.on("timeout", onTimeout(state));
  state._connection.setTimeout(state.settings.timeout);
  state._connection.setNoDelay(true);
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
  GET_CLASS: "%1CLSS ?\r"
};

const runCommand = (command: string, device: Device, ...args: any[]) => {
  return new Promise<PJLinkResponse>(resolve => {
    if (args.length > 0) {
      command = Utils.replaceAll(command, args);
    }

    const state = init(
      command,
      (response: PJLinkResponse) => resolve(response),
      device
    );
    connect(state);
  });
};

export const setPower = (device: Device, power: number) => {
  return runCommand(COMMAND.SET_POWER, device, power);
};

export const getPower = (device: Device) => {
  return runCommand(COMMAND.GET_POWER, device);
};

export const setInput = (device: Device, input: number, channel?: number) => {
  return runCommand(COMMAND.SET_INPUT, device, input,
    channel === undefined ? 1 : channel);
};

export const getInput = (device: Device) => {
  return runCommand(COMMAND.GET_INPUT, device);
};

export const muteVideo = (device: Device) => {
  return runCommand(COMMAND.MUTE_VIDEO, device);
};

export const unmuteVideo = (device: Device) => {
  return runCommand(COMMAND.UNMUTE_VIDEO, device);
};

export const muteAudio = (device: Device) => {
  return runCommand(COMMAND.MUTE_AUDIO, device);
};

export const unmuteAudio = (device: Device) => {
  return runCommand(COMMAND.UNMUTE_AUDIO, device);
};

export const mute = (device: Device) => {
  return runCommand(COMMAND.MUTE, device);
};

export const unmute = (device: Device) => {
  return runCommand(COMMAND.UNMUTE, device);
};

export const getIsMuted = (device: Device) => {
  return runCommand(COMMAND.GET_IS_MUTED, device);
};

export const getErrors = (device: Device) => {
  return runCommand(COMMAND.GET_ERRORS, device);
};

export const getLamp = (device: Device) => {
  return runCommand(COMMAND.GET_LAMP, device);
};

export const getInputs = (device: Device) => {
  return runCommand(COMMAND.GET_INPUTS, device);
};

export const getName = (device: Device) => {
  return runCommand(COMMAND.GET_NAME, device);
};

export const getManufacturer = (device: Device) => {
  return runCommand(COMMAND.GET_MANUFACTURER, device);
};

export const getProduct = (device: Device) => {
  return runCommand(COMMAND.GET_PRODUCT, device);
};

export const getInfo = (device: Device) => {
  return runCommand(COMMAND.GET_INFO, device);
};

export const getClass = (device: Device) => {
  return runCommand(COMMAND.GET_CLASS, device);
};
