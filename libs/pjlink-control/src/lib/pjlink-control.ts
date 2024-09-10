import * as net from "net";
import * as crypto from "crypto";
import { Device, isError, OVEException, PJLinkSource } from "@ove/ove-types";
import { replaceAll } from "@ove/ove-utils";
import { z } from "zod";

/* global Buffer, console */

type PJLinkState = {
  settings: {
    ip: string
    port: number
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
  timeout: number,
  device?: Device,
  password?: string
): PJLinkState => {
  return {
    settings: {
      ip: device?.ip ?? "192.168.1.1",
      port: device?.port ?? 4352,
      password: password ?? null,
      timeout: timeout
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
    const sessionToken = REGEX.AUTH_REGEX.exec(response)?.pop();

    if (sessionToken === undefined) {
      throw new Error("Session token cannot be undefined");
    }

    const digest = calcDigest(sessionToken, state.settings.password);
    const message = `${digest}%${state.class}${state._curCmd}\r`;

    state._connection?.write(message);
  } else if (REGEX.SUCCESS_REGEX.test(response)) {
    state._callback?.(response);
  } else if (REGEX.GET_REGEX.test(response)) {
    const res = REGEX.GET_REGEX.exec(response)?.pop();
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

const connect = (state: PJLinkState, ac?: AbortController) => {
  state._connection = net.connect({
    host: state.settings.ip,
    port: state.settings.port,
    signal: ac?.signal,
    timeout: state.settings.timeout,
    noDelay: true
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
  GET_CLASS: "%1CLSS ?\r"
};

type CommandArgs = {
  timeout: number,
  device: Device,
  ac?: AbortController
}

const runCommand = (
  command: string,
  cmd: CommandArgs,
  ...args: string[]
) =>
  new Promise<PJLinkResponse>(resolve => {
    if (args.length > 0) {
      command = replaceAll(command, args);
    }

    const state = init(
      command,
      (response: PJLinkResponse) => resolve(response),
      cmd.timeout,
      cmd.device
    );
    connect(state, cmd.ac);
  });

export const setPower = (args: CommandArgs, power: number) =>
  runCommand(COMMAND.SET_POWER, args, power.toString());

export const getPower = (args: CommandArgs) =>
  runCommand(COMMAND.GET_POWER, args);

export const setInput = (
  args: CommandArgs,
  input: number,
  channel?: number
) =>
  runCommand(COMMAND.SET_INPUT, args, input.toString(),
    (channel ?? 1).toString());

export const getInput = (args: CommandArgs) =>
  runCommand(COMMAND.GET_INPUT, args);

export const muteVideo = (args: CommandArgs) =>
  runCommand(COMMAND.MUTE_VIDEO, args);

export const unmuteVideo = (args: CommandArgs) =>
  runCommand(COMMAND.UNMUTE_VIDEO, args);

export const muteAudio = (args: CommandArgs) =>
  runCommand(COMMAND.MUTE_AUDIO, args);

export const unmuteAudio = (args: CommandArgs) =>
  runCommand(COMMAND.UNMUTE_AUDIO, args);

export const mute = (args: CommandArgs) =>
  runCommand(COMMAND.MUTE, args);

export const unmute = (args: CommandArgs) =>
  runCommand(COMMAND.UNMUTE, args);

export const getIsMuted = async (args: CommandArgs) => {
  const res = await runCommand(COMMAND.GET_IS_MUTED, args);
  if (isError(res)) return res;
  return res.split("=")[1] === "31";
};

export const getIsAudioMuted = async (args: CommandArgs) => {
  const res = await runCommand(COMMAND.GET_IS_MUTED, args);
  if (isError(res)) return res;
  return res.split("=")[1] === "21";
};

export const getIsVideoMuted = async (args: CommandArgs) => {
  const res = await runCommand(COMMAND.GET_IS_MUTED, args);
  if (isError(res)) return res;
  return res.split("=")[1] === "11";
};

export const getErrors = (args: CommandArgs) =>
  runCommand(COMMAND.GET_ERRORS, args);

export const getLamp = (args: CommandArgs) =>
  runCommand(COMMAND.GET_LAMP, args);

export const getInputs = (args: CommandArgs) =>
  runCommand(COMMAND.GET_INPUTS, args);

export const getName = (args: CommandArgs) =>
  runCommand(COMMAND.GET_NAME, args);

export const getManufacturer = (args: CommandArgs) =>
  runCommand(COMMAND.GET_MANUFACTURER, args);

export const getProduct = (args: CommandArgs) =>
  runCommand(COMMAND.GET_PRODUCT, args);

export const getInfo = (args: CommandArgs) =>
  runCommand(COMMAND.GET_INFO, args);

export const getClass = (args: CommandArgs) =>
  runCommand(COMMAND.GET_CLASS, args);
