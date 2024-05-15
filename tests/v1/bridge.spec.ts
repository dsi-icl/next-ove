import { createServer } from "http";
import { type Socket as ClientSocket } from "socket.io-client";
import { type Namespace, Server, type Socket as ServerSocket } from "socket.io";
import { type DefaultEventsMap } from "socket.io/dist/typed-events";
import { type Device, OVEExceptionSchema } from "../../libs/ove-types/src";
import { readFileSync } from "atomically";
import * as path from "path";
import { execSync } from "child_process";
import { z } from "zod";
import {
  AudioSchema,
  BatterySchema,
  BluetoothSchema,
  BrowserSchema,
  CPUSchema,
  DockerSchema,
  FSSchema,
  GeneralSchema,
  GraphicsSchema,
  MDCSchema,
  MemorySchema,
  NetworkSchema,
  OSSchema,
  PJLinkSchema,
  PrinterSchema,
  ProcessesSchema,
  SystemSchema,
  USBSchema,
  VboxSchema,
  WifiSchema
} from "./utils";

type Env = {
  "bridge-env": string
}

type BridgeEnv = { HARDWARE: Device[], BRIDGE_NAME?: string }

const ENVIRONMENT = "dev";
const SKIP_POWER = true;

const SHORT_TIMEOUT = 10_000;

const mdcSources = ["UNKNOWN", "PC", "DVI", "DVI_VIDEO", "AV", "SVIDEO", "COMPONENT", "MAGICNET", "TV", "DTV", "HDMI1", "HDMI1_PC", "HDMI2", "HDMI2_PC", "DP", "DP2", "DP3"];
const pjlinkSources = ["RGB", "VIDEO", "DIGITAL", "STORAGE", "NETWORK"];

describe("ove-bridge hardware module", () => {
  let io: Server<DefaultEventsMap, DefaultEventsMap>,
    namespace: Namespace<DefaultEventsMap, DefaultEventsMap>,
    env: BridgeEnv,
    deviceDirectory: Map<string, boolean>,
    browserId: Map<string, number>,
    tag: string | undefined,
    serverSocket: ServerSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | ClientSocket<DefaultEventsMap, DefaultEventsMap>;

  const getNodes = () => env.HARDWARE.filter(({ type }) => type === "node").map(({ id }) => id);
  const getMDC = () => env.HARDWARE.filter(({ type }) => type === "mdc").map(({ id }) => id);
  const getPJLink = () => env.HARDWARE.filter(({ type }) => type === "pjlink").map(({ id }) => id);

  const validateMeta = (result: { meta: { bridge: string } }) => {
    expect(result.meta).toStrictEqual({ bridge: env.BRIDGE_NAME });
  };

  const validateResponse = (deviceId: string, result: {
    response: object
  }, onSuccess: () => void) => {
    if (!deviceDirectory.get(deviceId)) {
      expect(OVEExceptionSchema.safeParse(result.response).success).toBe(true);
    } else {
      onSuccess();
    }
  };

  const validateInvalidTag = async (ev: string, args: object) => {
    const result = await serverSocket.emitWithAck(ev, {
      ...args,
      tag: "invalid"
    });

    validateMeta(result);
    expect(result.response).toStrictEqual({ oveError: `No devices found with tag: invalid` });
  };

  const validateResponseAll = (result: {
    response: { deviceId: string, response: unknown }[]
  }, onSuccess: (response: unknown, deviceId: string) => void) => {
    result.response.forEach(({ deviceId, response }) => {
      if (!deviceDirectory.get(deviceId)) {
        expect(OVEExceptionSchema.safeParse(response).success).toBe(true);
      } else {
        onSuccess(response, deviceId);
      }
    });
  };

  const validateStatusResponse = async (ev: string, deviceId: string) => {
    const result = await serverSocket.emitWithAck(ev, { deviceId });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      expect(result.response).toBe(true);
    });
  };

  const validateStatusResponseAll = async (ev: string, tag?: string) => {
    const result = await serverSocket.emitWithAck(ev, { tag });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toBe(true);
    });
  };

  const validateWithSchema = (response: unknown, schema: z.ZodTypeAny) => {
    const parsed = schema.safeParse(response);

    if (!parsed.success) {
      console.log(JSON.stringify(parsed.error));
    }

    expect(parsed.success).toBe(true);
  };

  const getStatus = async (deviceId: string) => {
    const result = await serverSocket.emitWithAck("getStatus", { deviceId });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      expect(result.response).toBe(true);
    });
  };

  const getInfo = async (deviceId: string, schema: z.ZodTypeAny, type?: string) => {
    const result = await serverSocket.emitWithAck("getInfo", {
      deviceId,
      type
    });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      validateWithSchema(result.response, schema);
    });
  };

  const getInfoAll = async (schema: z.ZodTypeAny, tag: undefined | string, type: string | undefined) => {
    const result = await serverSocket.emitWithAck("getInfoAll", { tag, type });

    validateMeta(result);
    validateResponseAll(result, response => {
      if (type !== undefined) {
        validateWithSchema(response, schema);
      } else {
        validateWithSchema(response, z.union([schema, MDCSchema, PJLinkSchema]));
      }
    });
  };

  const pingDevices = () => Promise.all(env.HARDWARE.map(({ id, ip }) => {
    try {
      const regex = /[^%]+, (.*)% packet loss/;
      const res = execSync(`ping -t 1 ${ip} -c 1`).toString();

      return regex.test(res) ? [id, parseFloat(res.match(regex)?.[1] ?? "-1") === 0] as const : [id, false] as const;
    } catch (e) {
      `${e}`; // expected handling of error - TS RULE S2486
      return [id, false] as const;
    }
  }));

  const getValidTag = () => {
    const tags = env?.HARDWARE.flatMap(({ tags }) => tags) ?? [];
    if (tags.length === 0) return undefined;
    return tags[Math.floor(Math.random() * tags.length)];
  };

  const initEnv = () => {
    const temp = JSON.parse(readFileSync(path.join(__dirname, "private.env.json")).toString()) as Record<string, Env>;
    env = JSON.parse(readFileSync(temp[ENVIRONMENT]["bridge-env"]).toString()) as BridgeEnv;
  };

  beforeAll((done) => {
    initEnv();
    browserId = new Map();
    const httpServer = createServer();
    io = new Server(httpServer);
    pingDevices().then(res => {
      deviceDirectory = new Map(res);
      httpServer.listen(3333, () => {
        namespace = io.of("/hardware");
        namespace.on("connection", socket => {
          serverSocket = socket;
          done();
        });
      });
    });
  }, SHORT_TIMEOUT);

  afterAll(() => {
    io.close();
  }, SHORT_TIMEOUT);

  test("should work", () => {
    expect(namespace.sockets.size).toBeGreaterThan(0);
    expect(serverSocket).not.toBeNull();
    expect(namespace.sockets.get("dev")).not.toBeNull();
  }, SHORT_TIMEOUT);

  test("getStatus - invalid ID", async () => {
    const result = await serverSocket.emitWithAck("getStatus", { deviceId: "invalid" });

    validateMeta(result);
    expect(result.response).toStrictEqual({ oveError: "No device found with id: invalid" });
  }, SHORT_TIMEOUT);

  // GET STATUS
  test("getStatus - node", () => Promise.all(getNodes().map(getStatus)), SHORT_TIMEOUT);
  test("getStatus - mdc", () => Promise.all(getMDC().map(getStatus)), SHORT_TIMEOUT);
  test("getStatus - pjlink", () => Promise.all(getPJLink().map(getStatus)), SHORT_TIMEOUT);

  // GET INFO
  test("getInfo - node, no type", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, GeneralSchema))), SHORT_TIMEOUT);
  test("getInfo - node, invalid type", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, GeneralSchema, "invalid"))), SHORT_TIMEOUT);
  test("getInfo - node, general", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, GeneralSchema, "general"))), SHORT_TIMEOUT);
  test("getInfo - node, system", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, SystemSchema, "system"))), SHORT_TIMEOUT);
  test("getInfo - node, cpu", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, CPUSchema, "cpu"))), SHORT_TIMEOUT);
  test("getInfo - node, memory", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, MemorySchema, "memory"))), SHORT_TIMEOUT);
  test("getInfo - node, battery", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, BatterySchema, "battery"))), SHORT_TIMEOUT);
  test("getInfo - node, graphics", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, GraphicsSchema, "graphics"))), SHORT_TIMEOUT);
  test("getInfo - node, os", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, OSSchema, "os"))), SHORT_TIMEOUT);
  test("getInfo - node, processes", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, ProcessesSchema, "processes"))), SHORT_TIMEOUT);
  test("getInfo - node, fs", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, FSSchema, "fs"))), SHORT_TIMEOUT);
  test("getInfo - node, usb", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, USBSchema, "usb"))), SHORT_TIMEOUT);
  test("getInfo - node, printer", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, PrinterSchema, "printer"))), SHORT_TIMEOUT);
  test("getInfo - node, audio", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, AudioSchema, "audio"))), SHORT_TIMEOUT);
  test("getInfo - node, network", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, NetworkSchema, "network"))), SHORT_TIMEOUT);
  test("getInfo - node, wifi", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, WifiSchema, "wifi"))), SHORT_TIMEOUT);
  test("getInfo - node, bluetooth", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, BluetoothSchema, "bluetooth"))), SHORT_TIMEOUT);
  test("getInfo - node, docker", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, DockerSchema, "docker"))), SHORT_TIMEOUT);
  test("getInfo - node, vbox", () => Promise.all(getNodes().map(deviceId => getInfo(deviceId, VboxSchema, "vbox"))), SHORT_TIMEOUT);
  test("getInfo - mdc", () => Promise.all(getMDC().map(deviceId => getInfo(deviceId, MDCSchema))), SHORT_TIMEOUT);
  test("getInfo - pjlink", () => Promise.all(getPJLink().map(deviceId => getInfo(deviceId, PJLinkSchema))), SHORT_TIMEOUT);

  // GET BROWSERS
  test("getBrowsers", () => Promise.all(getNodes().map(async deviceId => {
    const result = await serverSocket.emitWithAck("getBrowsers", { deviceId });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      for (const [key, value] of result.response.entries()) {
        validateWithSchema(key, z.number());
        validateWithSchema(value, BrowserSchema);
      }
    });
  })), SHORT_TIMEOUT);

  // DELETE BROWSERS
  test("closeBrowsers", () => Promise.all(getNodes().map(async deviceId => validateStatusResponse("closeBrowsers", deviceId))), SHORT_TIMEOUT);

  // OPEN BROWSER
  test("openBrowser", () => Promise.all(getNodes().map(async deviceId => {
    const result = await serverSocket.emitWithAck("openBrowser", {
      deviceId,
      displayId: 1,
      url: "http://localhost:8080"
    });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      validateWithSchema(result.response, z.number());
      browserId.set(deviceId, result.response);
    });
  })), SHORT_TIMEOUT);

  // GET BROWSER
  test("getBrowser", () => Promise.all(getNodes().map(async deviceId => {
    const result = await serverSocket.emitWithAck("getBrowser", {
      deviceId,
      browserId: browserId.get(deviceId)
    });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      validateWithSchema(result.response, z.strictObject({
        displayId: z.number(),
        url: z.string(),
        windowId: z.string()
      }));
    });
  })), SHORT_TIMEOUT);

  // CLOSE BROWSER
  test("closeBrowser", () => Promise.all(getNodes().map(async deviceId => {
    const result = await serverSocket.emitWithAck("closeBrowser", {
      deviceId,
      browserId: browserId.get(deviceId)
    });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      expect(result.response).toBe(true);
    });

    browserId.delete(deviceId);
  })), SHORT_TIMEOUT);

  // EXECUTE
  test("execute", () => Promise.all(getNodes().map(async deviceId => {
    const result = await serverSocket.emitWithAck("execute", {
      deviceId,
      command: "echo hello world"
    });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      expect(result.response).toStrictEqual({ response: "hello world\n" });
    });
  })), SHORT_TIMEOUT);

  // SCREENSHOT
  test("screenshot", () => Promise.all(getNodes().map(async deviceId => {
    const result = await serverSocket.emitWithAck("screenshot", {
      deviceId,
      method: "response",
      screens: [1]
    });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      expect(Array.isArray(result.response)).toBe(true);
    });
  })), SHORT_TIMEOUT);

  // START
  test("start - node", () => Promise.all(getNodes().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("start", deviceId);
  })), SHORT_TIMEOUT);

  test("start - mdc", () => Promise.all(getMDC().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("start", deviceId);
  })), SHORT_TIMEOUT);

  test("start - pjlink", () => Promise.all(getPJLink().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("start", deviceId);
  })), SHORT_TIMEOUT);

  // REBOOT
  test("reboot - node", () => Promise.all(getNodes().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("reboot", deviceId);
  })), SHORT_TIMEOUT);

  test("reboot - mdc", () => Promise.all(getMDC().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("reboot", deviceId);
  })), SHORT_TIMEOUT);

  test("reboot - pjlink", () => Promise.all(getPJLink().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("reboot", deviceId);
  })), SHORT_TIMEOUT);

  // SHUTDOWN
  test("shutdown - node", () => Promise.all(getNodes().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("shutdown", deviceId);
  })), SHORT_TIMEOUT);

  test("shutdown - mdc", () => Promise.all(getMDC().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("shutdown", deviceId);
  })), SHORT_TIMEOUT);

  test("shutdown - pjlink", () => Promise.all(getPJLink().map(deviceId => {
    if (SKIP_POWER) return;
    return validateStatusResponse("shutdown", deviceId);
  })), SHORT_TIMEOUT);

  // SET VOLUME
  test("setVolume - mdc", () => Promise.all(getMDC().map(async deviceId => {
    const result = await serverSocket.emitWithAck("setVolume", {
      deviceId,
      volume: 50
    });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      expect(result.response).toBe(true);
    });
  })), SHORT_TIMEOUT);

  test("setVolume - pjlink", () => Promise.all(getPJLink().map(async deviceId => {
    const result = await serverSocket.emitWithAck("setVolume", {
      deviceId,
      volume: 50
    });

    validateMeta(result);
    validateResponse(deviceId, result, () => {
      expect(result.response).toBe(true);
    });
  })), SHORT_TIMEOUT);

  // MUTE
  test("mute - mdc", () => Promise.all(getMDC().map(deviceId => validateStatusResponse("mute", deviceId))), SHORT_TIMEOUT);
  test("mute - pjlink", () => Promise.all(getPJLink().map(deviceId => validateStatusResponse("mute", deviceId))), SHORT_TIMEOUT);

  // UNMUTE
  test("unmute - mdc", () => Promise.all(getMDC().map(deviceId => validateStatusResponse("unmute", deviceId))), SHORT_TIMEOUT);
  test("unmute - pjlink", () => Promise.all(getPJLink().map(deviceId => validateStatusResponse("unmute", deviceId))), SHORT_TIMEOUT);

  // MUTE AUDIO
  test("muteAudio", () => Promise.all(getPJLink().map(deviceId => validateStatusResponse("muteAudio", deviceId))), SHORT_TIMEOUT);

  // UNMUTE AUDIO
  test("unmuteAudio", () => Promise.all(getPJLink().map(deviceId => validateStatusResponse("unmuteAudio", deviceId))), SHORT_TIMEOUT);

  // MUTE VIDEO
  test("muteVideo", () => Promise.all(getPJLink().map(deviceId => validateStatusResponse("muteVideo", deviceId))), SHORT_TIMEOUT);

  // UNMUTE VIDEO
  test("unmuteVideo", () => Promise.all(getPJLink().map(deviceId => validateStatusResponse("unmuteVideo", deviceId))), SHORT_TIMEOUT);

  // SET SOURCE
  test("setSource - mdc", () => {
    return Promise.all(getMDC().flatMap(deviceId => mdcSources.map(async source => {
      const result = await serverSocket.emitWithAck("setSource", {
        deviceId,
        source
      });

      validateMeta(result);
      validateResponse(deviceId, result, () => {
        expect(result.response).toBe(true);
      });
    })));
  }, SHORT_TIMEOUT);

  test("setSource - pjlink", () => {
    return Promise.all(getPJLink().flatMap(deviceId => pjlinkSources.map(async source => {
      const result = await serverSocket.emitWithAck("setSource", {
        deviceId,
        source
      });

      validateMeta(result);
      validateResponse(deviceId, result, () => {
        expect(result.response).toBe(true);
      });
    })));
  }, SHORT_TIMEOUT);

  // GET STATUS - ALL
  test("getStatusAll", () => validateStatusResponseAll("getStatusAll"), SHORT_TIMEOUT);
  test("getStatusAll - invalid tag", () => validateInvalidTag("getStatusAll", {}), SHORT_TIMEOUT);
  test("getStatusAll - valid tag", () => validateStatusResponseAll("getStatusAll", getValidTag()), SHORT_TIMEOUT);

  // GET INFO - ALL
  test("getInfoAll - no type", () => getInfoAll(GeneralSchema, undefined, undefined), SHORT_TIMEOUT);
  test("getInfoAll - no type, valid tag", () => getInfoAll(GeneralSchema, getValidTag(), undefined), SHORT_TIMEOUT);
  test("getInfoAll - no type, invalid tag", () => validateInvalidTag("getInfoAll", {}), SHORT_TIMEOUT);

  test("getInfoAll - invalid type", () => getInfoAll(GeneralSchema, undefined, "invalid"), SHORT_TIMEOUT);
  test("getInfoAll - invalid type, valid tag", () => getInfoAll(GeneralSchema, getValidTag(), "invalid"), SHORT_TIMEOUT);
  test("getInfoAll - invalid type, invalid tag", () => validateInvalidTag("getInfoAll", { type: "invalid" }), SHORT_TIMEOUT);

  test("getInfoAll - general", () => getInfoAll(GeneralSchema, undefined, "general"), SHORT_TIMEOUT);
  test("getInfoAll - general, valid tag", () => getInfoAll(GeneralSchema, getValidTag(), "general"), SHORT_TIMEOUT);
  test("getInfoAll - general, invalid tag", () => validateInvalidTag("getInfoAll", { type: "general" }), SHORT_TIMEOUT);

  test("getInfoAll - system", () => getInfoAll(SystemSchema, undefined, "system"), SHORT_TIMEOUT);
  test("getInfoAll - system, valid tag", () => getInfoAll(SystemSchema, getValidTag(), "system"), SHORT_TIMEOUT);
  test("getInfoAll - system, invalid tag", () => validateInvalidTag("getInfoAll", { type: "system" }), SHORT_TIMEOUT);

  test("getInfoAll - cpu", () => getInfoAll(CPUSchema, undefined, "cpu"), SHORT_TIMEOUT);
  test("getInfoAll - cpu, valid tag", () => getInfoAll(CPUSchema, getValidTag(), "cpu"), SHORT_TIMEOUT);
  test("getInfoAll - cpu, invalid tag", () => validateInvalidTag("getInfoAll", { type: "cpu" }), SHORT_TIMEOUT);

  test("getInfoAll - memory", () => getInfoAll(MemorySchema, undefined, "memory"), SHORT_TIMEOUT);
  test("getInfoAll - memory, valid tag", () => getInfoAll(MemorySchema, getValidTag(), "memory"), SHORT_TIMEOUT);
  test("getInfoAll - memory, invalid tag", () => validateInvalidTag("getInfoAll", { type: "memory" }), SHORT_TIMEOUT);

  test("getInfoAll - battery", () => getInfoAll(BatterySchema, undefined, "battery"), SHORT_TIMEOUT);
  test("getInfoAll - battery, valid tag", () => getInfoAll(BatterySchema, getValidTag(), "battery"), SHORT_TIMEOUT);
  test("getInfoAll - battery, invalid tag", () => validateInvalidTag("getInfoAll", { type: "battery" }), SHORT_TIMEOUT);

  test("getInfoAll - graphics", () => getInfoAll(GraphicsSchema, undefined, "graphics"), SHORT_TIMEOUT);
  test("getInfoAll - graphics, valid tag", () => getInfoAll(GraphicsSchema, getValidTag(), "graphics"), SHORT_TIMEOUT);
  test("getInfoAll - graphics, invalid tag", () => validateInvalidTag("getInfoAll", { type: "graphics" }), SHORT_TIMEOUT);

  test("getInfoAll - os", () => getInfoAll(OSSchema, undefined, "os"), SHORT_TIMEOUT);
  test("getInfoAll - os, valid tag", () => getInfoAll(OSSchema, getValidTag(), "os"), SHORT_TIMEOUT);
  test("getInfoAll - os, invalid tag", () => validateInvalidTag("getInfoAll", { type: "os" }), SHORT_TIMEOUT);

  test("getInfoAll - processes", () => getInfoAll(ProcessesSchema, undefined, "processes"), SHORT_TIMEOUT);
  test("getInfoAll - processes, valid tag", () => getInfoAll(ProcessesSchema, getValidTag(), "processes"), SHORT_TIMEOUT);
  test("getInfoAll - processes, invalid tag", () => validateInvalidTag("getInfoAll", { type: "processes" }), SHORT_TIMEOUT);

  test("getInfoAll - fs", () => getInfoAll(FSSchema, undefined, "fs"), SHORT_TIMEOUT);
  test("getInfoAll - fs, valid tag", () => getInfoAll(FSSchema, getValidTag(), "fs"), SHORT_TIMEOUT);
  test("getInfoAll - fs, invalid tag", () => validateInvalidTag("getInfoAll", { type: "fs" }), SHORT_TIMEOUT);

  test("getInfoAll - usb", () => getInfoAll(USBSchema, undefined, "usb"), SHORT_TIMEOUT);
  test("getInfoAll - usb, valid tag", () => getInfoAll(USBSchema, getValidTag(), "usb"), SHORT_TIMEOUT);
  test("getInfoAll - usb, invalid tag", () => validateInvalidTag("getInfoAll", { type: "usb" }), SHORT_TIMEOUT);

  test("getInfoAll - audio", () => getInfoAll(AudioSchema, undefined, "audio"), SHORT_TIMEOUT);
  test("getInfoAll - audio, valid tag", () => getInfoAll(AudioSchema, getValidTag(), "audio"), SHORT_TIMEOUT);
  test("getInfoAll - audio, invalid tag", () => validateInvalidTag("getInfoAll", { type: "audio" }), SHORT_TIMEOUT);

  test("getInfoAll - network", () => getInfoAll(NetworkSchema, undefined, "network"), SHORT_TIMEOUT);
  test("getInfoAll - network, valid tag", () => getInfoAll(NetworkSchema, getValidTag(), "network"), SHORT_TIMEOUT);
  test("getInfoAll - network, invalid tag", () => validateInvalidTag("getInfoAll", { type: "audio" }), SHORT_TIMEOUT);

  test("getInfoAll - wifi", () => getInfoAll(WifiSchema, undefined, "wifi"), SHORT_TIMEOUT);
  test("getInfoAll - wifi, valid tag", () => getInfoAll(WifiSchema, getValidTag(), "wifi"), SHORT_TIMEOUT);
  test("getInfoAll - wifi, invalid tag", () => validateInvalidTag("getInfoAll", { type: "wifi" }), SHORT_TIMEOUT);

  test("getInfoAll - bluetooth", () => getInfoAll(BluetoothSchema, undefined, "bluetooth"), SHORT_TIMEOUT);
  test("getInfoAll - bluetooth, valid tag", () => getInfoAll(BluetoothSchema, getValidTag(), "bluetooth"), SHORT_TIMEOUT);
  test("getInfoAll - bluetooth, invalid tag", () => validateInvalidTag("getInfoAll", { type: "bluetooth" }), SHORT_TIMEOUT);

  test("getInfoAll - docker", () => getInfoAll(DockerSchema, undefined, "docker"), SHORT_TIMEOUT);
  test("getInfoAll - docker, valid tag", () => getInfoAll(DockerSchema, getValidTag(), "docker"), SHORT_TIMEOUT);
  test("getInfoAll - docker, invalid tag", () => validateInvalidTag("getInfoAll", { type: "docker" }), SHORT_TIMEOUT);

  test("getInfoAll - vbox", () => getInfoAll(VboxSchema, undefined, "vbox"), SHORT_TIMEOUT);
  test("getInfoAll - vbox, valid tag", () => getInfoAll(VboxSchema, getValidTag(), "vbox"), SHORT_TIMEOUT);
  test("getInfoAll - vbox, invalid tag", () => validateInvalidTag("getInfoAll", { type: "vbox" }), SHORT_TIMEOUT);

  // BROWSERS

  // NO TAG
  test("getBrowsersAll", async () => {
    const result = await serverSocket.emitWithAck("getBrowsersAll", {});

    validateMeta(result);
    validateResponseAll(result, response => {
      validateWithSchema(response, BrowserSchema);
    });
  }, SHORT_TIMEOUT);

  test("closeBrowsersAll", () => validateStatusResponseAll("closeBrowsersAll"), SHORT_TIMEOUT);

  test("openBrowserAll", async () => {
    const result = await serverSocket.emitWithAck("openBrowserAll", {
      displayId: 1,
      url: "https://ove.readthedocs.io"
    });

    validateMeta(result);
    validateResponseAll(result, (response) => {
      expect(response).toBe(0);
    });
  }, SHORT_TIMEOUT);

  test("getBrowserAll", async () => {
    const result = await serverSocket.emitWithAck("getBrowserAll", { browserId: 0 });

    validateMeta(result);
    validateResponseAll(result, response => {
      validateWithSchema(response, BrowserSchema);
      expect((response as z.infer<typeof BrowserSchema>).displayId).toBe(1);
      expect((response as z.infer<typeof BrowserSchema>).url).toBe("https://ove.readthedocs.io");
    });
  }, SHORT_TIMEOUT);

  test("closeBrowserAll", () => validateStatusResponseAll("closeBrowserAll"), SHORT_TIMEOUT);

  // VALID TAG
  test("getBrowsersAll - valid tag", async () => {
    tag = getValidTag();
    const result = await serverSocket.emitWithAck("getBrowsersAll", { tag });

    validateMeta(result);
    validateResponseAll(result, response => {
      validateWithSchema(response, BrowserSchema);
    });
  }, SHORT_TIMEOUT);

  test("closeBrowsersAll - valid tag", () => validateStatusResponseAll("closeBrowsersAll", tag), SHORT_TIMEOUT);

  test("openBrowserAll - valid tag", async () => {
    const result = await serverSocket.emitWithAck("openBrowserAll", { tag });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toBe(0);
    });
  }, SHORT_TIMEOUT);

  test("getBrowserAll - valid tag", async () => {
    const result = await serverSocket.emitWithAck("getBrowserAll", {
      tag,
      browserId: 0
    });

    validateMeta(result);
    validateResponseAll(result, response => {
      validateWithSchema(response, BrowserSchema);
    });
  }, SHORT_TIMEOUT);

  test("closeBrowserAll - valid tag", async () => {
    const result = await serverSocket.emitWithAck("closeBrowserAll", {
      tag,
      browserId: 0
    });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toBe(true);
    });

    tag = undefined;
  }, SHORT_TIMEOUT);

  // INVALID TAG
  test("getBrowsersAll", () => validateInvalidTag("getBrowsersAll", {}), SHORT_TIMEOUT);
  test("closeBrowsersAll", () => validateInvalidTag("closeBrowsersAll", {}), SHORT_TIMEOUT);
  test("openBrowserAll", () => validateInvalidTag("openBrowserAll", {
    displayId: 1,
    url: "https://ove.readthedocs.io"
  }), SHORT_TIMEOUT);
  test("getBrowserAll", () => validateInvalidTag("getBrowserAll", { browserId: 0 }), SHORT_TIMEOUT);
  test("closeBrowserAll", () => validateInvalidTag("closeBrowserAll", { browserId: 0 }), SHORT_TIMEOUT);

  test("executeAll", async () => {
    const result = await serverSocket.emitWithAck("executeAll", { command: "echo hello world" });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toStrictEqual({ response: "hello world\n" });
    });
  }, SHORT_TIMEOUT);

  test("executeAll - valid tag", async () => {
    const result = await serverSocket.emitWithAck("executeAll", {
      command: "echo hello world",
      tag: getValidTag()
    });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toStrictEqual({ response: "hello world\n" });
    });
  }, SHORT_TIMEOUT);

  test("executeAll - invalid tag", () => validateInvalidTag("executeAll", { command: "echo hello world" }), SHORT_TIMEOUT);

  test("screenshotAll", async () => {
    const result = await serverSocket.emitWithAck("screenshotAll", {
      method: "response",
      screens: [1]
    });

    validateMeta(result);
    validateResponseAll(result, response => {
      validateWithSchema(response, z.string());
    });
  }, SHORT_TIMEOUT);

  test("screenshotAll - valid tag", async () => {
    const result = await serverSocket.emitWithAck("screenshotAll", {
      method: "response",
      screens: [1],
      tag: getValidTag()
    });

    validateMeta(result);
    validateResponseAll(result, response => {
      validateWithSchema(response, z.string());
    });
  }, SHORT_TIMEOUT);

  test("screenshotAll - invalid tag", () => validateInvalidTag("screenshotAll", {
    method: "response",
    screens: [1]
  }), SHORT_TIMEOUT);

  // POWER

  // NO TAG
  test("startAll", async () => {
    if (SKIP_POWER) return;
    return validateStatusResponseAll("startAll");
  }, SHORT_TIMEOUT);

  test("rebootAll", async () => {
    if (SKIP_POWER) return;
    return validateStatusResponseAll("rebootAll");
  }, SHORT_TIMEOUT);

  test("shutdownAll", async () => {
    if (SKIP_POWER) return;
    return validateStatusResponseAll("shutdownAll");
  }, SHORT_TIMEOUT);

  // VALID TAG
  test("startAll - valid tag", async () => {
    if (SKIP_POWER) return;

    tag = getValidTag();
    return validateStatusResponseAll("startAll", tag);
  }, SHORT_TIMEOUT);

  test("rebootAll - valid tag", async () => {
    if (SKIP_POWER) return;
    return validateStatusResponseAll("rebootAll", tag);
  }, SHORT_TIMEOUT);

  test("shutdownAll - valid tag", async () => {
    if (SKIP_POWER) return;
    await validateStatusResponseAll("shutdownAll", tag);
    tag = undefined;
  }, SHORT_TIMEOUT);

  // INVALID TAG
  test("startAll", async () => {
    if (SKIP_POWER) return;
    return validateInvalidTag("startAll", {});
  }, SHORT_TIMEOUT);
  test("rebootAll", async () => {
    if (SKIP_POWER) return;
    return validateInvalidTag("rebootAll", {});
  }, SHORT_TIMEOUT);
  test("shutdownAll", async () => {
    if (SKIP_POWER) return;
    return validateInvalidTag("shutdownAll", {});
  }, SHORT_TIMEOUT);

  // VOLUME

  // NO TAG
  test("setVolumeAll", async () => {
    const result = await serverSocket.emitWithAck("setVolumeAll", { volume: 50 });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toBe(true);
    });
  }, SHORT_TIMEOUT);

  test("muteAll", () => validateStatusResponseAll("muteAll"), SHORT_TIMEOUT);
  test("unmuteAll", () => validateStatusResponseAll("unmuteAll"), SHORT_TIMEOUT);
  test("muteAudioAll", () => validateStatusResponseAll("muteAudioAll"), SHORT_TIMEOUT);
  test("unmuteAudioAll", () => validateStatusResponseAll("unmuteAudioAll"), SHORT_TIMEOUT);
  test("muteVideoAll", () => validateStatusResponseAll("muteVideoAll"), SHORT_TIMEOUT);
  test("unmuteVideoAll", () => validateStatusResponseAll("unmuteVideoAll"), SHORT_TIMEOUT);

  // VALID TAG
  test("setVolumeAll - valid tag", async () => {
    tag = getValidTag();
    const result = await serverSocket.emitWithAck("setVolumeAll", {
      volume: 50,
      tag
    });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toBe(true);
    });
  }, SHORT_TIMEOUT);

  test("muteAll - valid tag", () => validateStatusResponseAll("muteAll", tag), SHORT_TIMEOUT);
  test("unmuteAll - valid tag", () => validateStatusResponseAll("unmuteAll", tag), SHORT_TIMEOUT);
  test("muteAudioAll - valid tag", () => validateStatusResponseAll("muteAudioAll", tag), SHORT_TIMEOUT);
  test("unmuteAudioAll - valid tag", () => validateStatusResponseAll("unmuteAudioAll", tag), SHORT_TIMEOUT);
  test("muteVideoAll - valid tag", () => validateStatusResponseAll("muteVideoAll", tag), SHORT_TIMEOUT);
  test("unmuteVideoAll - valid tag", () => validateStatusResponseAll("unmuteVideoAll", tag), SHORT_TIMEOUT);

  // INVALID TAG
  test("setVolumeAll - invalid tag", () => validateInvalidTag("setVolumeAll", { volume: 50 }), SHORT_TIMEOUT);
  test("muteAll - invalid tag", () => validateInvalidTag("muteAll", {}), SHORT_TIMEOUT);
  test("unmuteAll - invalid tag", () => validateInvalidTag("unmuteAll", {}), SHORT_TIMEOUT);
  test("muteAudioAll - invalid tag", () => validateInvalidTag("muteAudioAll", {}), SHORT_TIMEOUT);
  test("unmuteAudioAll - invalid tag", () => validateInvalidTag("unmuteAudioAll", {}), SHORT_TIMEOUT);
  test("muteVideoAll - invalid tag", () => validateInvalidTag("muteVideoAll", {}), SHORT_TIMEOUT);
  test("unmuteVideoAll - invalid tag", () => validateInvalidTag("unmuteVideoAll", {}), SHORT_TIMEOUT);

  // SOURCE

  // NO TAG
  test("setSourceAll - mdc", () => Promise.all(mdcSources.map(async source => {
    const result = await serverSocket.emitWithAck("setSourceAll", { source });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toBe(true);
    });
  })), SHORT_TIMEOUT);

  test("setSourceAll - pjlink", () => Promise.all(pjlinkSources.map(async source => {
    const result = await serverSocket.emitWithAck("setSourceAll", { source });

    validateMeta(result);
    validateResponseAll(result, response => {
      expect(response).toBe(true);
    });
  })), SHORT_TIMEOUT);

  // VALID TAG
  test("setSourceAll - mdc, valid tag", () => {
    const tag = getValidTag();
    return Promise.all(mdcSources.map(async source => {
      const result = await serverSocket.emitWithAck("setSourceAll", {
        source,
        tag
      });

      validateMeta(result);
      validateResponseAll(result, response => {
        expect(response).toBe(true);
      });
    }));
  }, SHORT_TIMEOUT);

  test("setSourceAll - pjlink, valid tag", () => {
    const tag = getValidTag();
    return Promise.all(pjlinkSources.map(async source => {
      const result = await serverSocket.emitWithAck("setSourceAll", {
        source,
        tag
      });

      validateMeta(result);
      validateResponseAll(result, response => {
        expect(response).toBe(true);
      });
    }));
  }, SHORT_TIMEOUT);

  // INVALID TAG
  test("setSourceAll - mdc, invalid tag", () => Promise.all(mdcSources.map(source => validateInvalidTag("setSourceAll", { source }))), SHORT_TIMEOUT);
  test("setSourceAll - pjlink, invalid tag", () => Promise.all(pjlinkSources.map(source => validateInvalidTag("setSourceAll", { source }))), SHORT_TIMEOUT);
});