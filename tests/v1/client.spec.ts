import { readFileSync, writeFileSync } from "atomically";
import fetch, { type Response as NodeResponse } from "node-fetch";
import path from "path";
import {
  AudioSchema,
  BatterySchema, BluetoothSchema,
  CPUSchema, DockerSchema, FSSchema,
  GeneralSchema, GraphicsSchema,
  MemorySchema, NetworkSchema, OSSchema, PrinterSchema, ProcessesSchema,
  SystemSchema, USBSchema, VboxSchema, WifiSchema
} from "./utils";
import { z, type ZodTypeAny } from "zod";

type Env = {
  "base-client-url": string
  "rest-client-url": string
  token: string
  "trpc-client-url": string
  "client-env": string
}

const ENVIRONMENT = "dev";
const SKIP_POWER = true;
const SHORT_TIMEOUT = 30_000;
const OK = 200;
const BROWSER_DELAY = 5_000;

const delay = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));
const initEnv = () => (JSON.parse(readFileSync(path.join(__dirname, "private.env.json")).toString()) as Record<string, Env>)[ENVIRONMENT];
const loadClientEnv = (env: Env) => JSON.parse(readFileSync(env["client-env"]).toString()) as Record<string, any>;
const saveClientEnv = (env: Env, clientEnv: Record<string, any>) => writeFileSync(env["client-env"], JSON.stringify(clientEnv, undefined, 2));

const validateJSON = async (res: NodeResponse, isTRPC = false): Promise<unknown> => {
  expect(res.status).toBe(OK);
  expect(res.headers.get("Content-Type")).toBe("application/json");
  return !isTRPC ? res.json() : (await res.json()).result.data;
};

const validateSchema = <T>(schema: ZodTypeAny, data: T) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    expect(parsed.error.errors).toStrictEqual([]);
  }
  expect(parsed.success).toBe(true);
};

const getBrowsers = async (url: string, config: object, isTRPC: boolean) => {
  const res = await fetch(url, config);
  const data = await validateJSON(res, isTRPC);

  validateSchema(z.record(z.string(), z.strictObject({
    displayId: z.number(),
    url: z.string()
  })), data);

  return data as Record<string, { displayId: number, url: string }>;
};

const closeBrowsers = async (url: string, config: object, isTRPC: boolean) => {
  const res = await fetch(url, config);
  const data = await validateJSON(res, isTRPC);

  expect(data).toBe(true);
};

const openBrowsers = async (url: string, config: object, windowConfig: object, isTRPC: boolean) => {
  const res = await fetch(url, config);
  const data = await validateJSON(res, isTRPC);

  expect(data).toStrictEqual(Array.from({ length: Object.keys(windowConfig).length }, (_x, i) => i));

  return data as number[];
};

describe("Basic functionality", () => {
  const env: { "base-client-url": string } = initEnv();

  test("OpenAPI specification available", async () => {
    const res = await fetch(env["base-client-url"]);
    const text = await res.text();

    expect(res.headers.get("content-type")).toContain("text/html");
    expect(text).not.toBe("");
  }, SHORT_TIMEOUT);
});

describe("Rest API", () => {
  let env = initEnv();
  let clientEnv = loadClientEnv(env);
  const auth = { headers: { Authorization: `Basic ${env.token}` } };

  test("GET /status", async () => {
    const res = await fetch(`${env["rest-client-url"]}/status`, auth);
    const data = await validateJSON(res);

    expect(data).toBe("on");
  }, SHORT_TIMEOUT);

  test("GET /info", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info`, auth);
    const data = await validateJSON(res);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=invalid", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=invalid`, auth);
    const data = await validateJSON(res);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=general", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=general`, auth);
    const data = await validateJSON(res);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=system", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=system`, auth);
    const data = await validateJSON(res);
    validateSchema(SystemSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=cpu", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=cpu`, auth);
    const data = await validateJSON(res);
    validateSchema(CPUSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=memory", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=memory`, auth);
    const data = await validateJSON(res);
    validateSchema(MemorySchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=battery", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=battery`, auth);
    const data = await validateJSON(res);
    validateSchema(BatterySchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=graphics", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=graphics`, auth);
    const data = await validateJSON(res);
    validateSchema(GraphicsSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=os", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=os`, auth);
    const data = await validateJSON(res);
    validateSchema(OSSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=processes", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=processes`, auth);
    const data = await validateJSON(res);
    validateSchema(ProcessesSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=fs", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=fs`, auth);
    const data = await validateJSON(res);
    validateSchema(FSSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=usb", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=usb`, auth);
    const data = await validateJSON(res);
    validateSchema(USBSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=printer", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=printer`, auth);
    const data = await validateJSON(res);
    validateSchema(PrinterSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=audio", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=audio`, auth);
    const data = await validateJSON(res);
    validateSchema(AudioSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=network", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=network`, auth);
    const data = await validateJSON(res);
    validateSchema(NetworkSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=wifi", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=wifi`, auth);
    const data = await validateJSON(res);
    validateSchema(WifiSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=bluetooth", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=bluetooth`, auth);
    const data = await validateJSON(res);
    validateSchema(BluetoothSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=docker", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=docker`, auth);
    const data = await validateJSON(res);
    validateSchema(DockerSchema, data);
  }, SHORT_TIMEOUT);

  test("GET /info?type=vbox", async () => {
    const res = await fetch(`${env["rest-client-url"]}/info?type=vbox`, auth);
    const data = await validateJSON(res);
    validateSchema(VboxSchema, data);
  }, SHORT_TIMEOUT);

  test("POST /shutdown", async () => {
    if (SKIP_POWER) return;
    const res = await fetch(`${env["rest-client-url"]}/shutdown`, {
      ...auth,
      method: "POST"
    });
    const data = await validateJSON(res);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("POST /reboot", async () => {
    if (SKIP_POWER) return;
    const res = await fetch(`${env["rest-client-url"]}/reboot`, {
      ...auth,
      method: "POST"
    });
    const data = await validateJSON(res);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("POST /execute", async () => {
    const res = await fetch(`${env["rest-client-url"]}/execute`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ command: "echo hello world" })
    });
    const data = await validateJSON(res);

    validateSchema(z.strictObject({ response: z.string() }), data);
    expect((data as { response: string }).response).toBe("hello world\n");
  }, SHORT_TIMEOUT);

  test("POST /screenshot", async () => {
    const res = await fetch(`${env["rest-client-url"]}/screenshot`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ method: "response", screens: [1] })
    });
    const data = await validateJSON(res);

    validateSchema(z.union([z.array(z.string()), z.strictObject({ oveError: z.literal("Screen capture access denied") })]), data);
  }, SHORT_TIMEOUT);

  test("POST /browser/{browserId}/reload", async () => {
    const browsers = await (await fetch(`${env["rest-client-url"]}/browsers`, auth)).json();
    const browserId = Object.keys(browsers).at(0);
    expect(browserId).toBe("0");
    const res = await fetch(`${env["rest-client-url"]}/browser/${browserId}/reload`, {
      ...auth,
      method: "POST"
    });
    const data = await validateJSON(res);
    expect(data).toBe(true);
  });

  test("POST /browsers/reload", async () => {
    const res = await fetch(`${env["rest-client-url"]}/browsers/reload`, {
      ...auth,
      method: "POST"
    });
    const data = await validateJSON(res);
    expect(data).toBe(true);
  });

  test("browsers", async () => {
    await getBrowsers(`${env["rest-client-url"]}/browsers`, auth, false);
    await closeBrowsers(`${env["rest-client-url"]}/browsers`, {
      ...auth,
      method: "DELETE"
    }, false);
    await delay(BROWSER_DELAY);
    await openBrowsers(`${env["rest-client-url"]}/browsers`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({})
    }, clientEnv["WINDOW_CONFIG"], false);
    await delay(BROWSER_DELAY);

    const res = await fetch(`${env["rest-client-url"]}/browsers`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({})
    });
    await delay(BROWSER_DELAY);
    await validateJSON(res);
  }, SHORT_TIMEOUT * 7 + BROWSER_DELAY * 5);

  test("GET /env/windowConfig", async () => {
    const config = await (await fetch(`${env["rest-client-url"]}/env/windowConfig`, auth)).json();
    expect(config).toStrictEqual(clientEnv["WINDOW_CONFIG"]);
  }, SHORT_TIMEOUT);

  test("POST /env/windowConfig", async () => {
    const config = {
      "1": "https://www.google.com",
      "2": "https://www.google.com"
    };
    await fetch(`${env["rest-client-url"]}/env/windowConfig`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ config })
    });
    expect(loadClientEnv(env)["WINDOW_CONFIG"]).toStrictEqual(config);
    const res = await fetch(`${env["rest-client-url"]}/env/windowConfig`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ config: clientEnv["WINDOW_CONFIG"] })
    });
    await validateJSON(res);
  }, SHORT_TIMEOUT);
});

describe("tRPC API", () => {
  let env = initEnv();
  let clientEnv = loadClientEnv(env);
  const auth = { headers: { Authorization: `Basic ${env.token}` } };

  beforeEach(() => {
    saveClientEnv(env, {
      ...clientEnv,
      AUTHORISED_CREDENTIALS: undefined,
      WINDOW_CONFIG: {
        "1": "https://ove.readthedocs.io",
        "2": "https://ove.readthedocs.io"
      }
    });
  });

  test("getStatus", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getStatus?input={}`, auth);
    const data = await validateJSON(res, true);

    expect(data).toBe("on");
  }, SHORT_TIMEOUT);

  test("getInfo - default", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - invalid", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "invalid"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - general", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "general"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - system", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "system"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(SystemSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - cpu", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "cpu"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(CPUSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - memory", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "memory"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(MemorySchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - battery", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "battery"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(BatterySchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - graphics", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "graphics"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(GraphicsSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - os", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "os"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(OSSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - processes", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "processes"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(ProcessesSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - fs", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "fs"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(FSSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - usb", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "usb"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(USBSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - printer", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "printer"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(PrinterSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - audio", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "audio"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(AudioSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - network", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "network"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(NetworkSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - wifi", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "wifi"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(WifiSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - bluetooth", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "bluetooth"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(BluetoothSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - docker", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "docker"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(DockerSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - vbox", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"type": "vbox"}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(VboxSchema, data);
  }, SHORT_TIMEOUT);

  test("shutdown", async () => {
    if (SKIP_POWER) return;
    const res = await fetch(`${env["trpc-client-url"]}/shutdown`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({})
    });
    const data = await validateJSON(res, true);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("reboot", async () => {
    if (SKIP_POWER) return;
    const res = await fetch(`${env["trpc-client-url"]}/reboot`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({})
    });
    const data = await validateJSON(res, true);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("execute", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/execute`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ command: "echo hello world" })
    });
    const data = await validateJSON(res, true);

    validateSchema(z.strictObject({ response: z.string() }), data);
    expect((data as { response: string }).response).toBe("hello world\n");
  }, SHORT_TIMEOUT);

  test("screenshot", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/screenshot`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ method: "response", screens: [1] })
    });
    const data = await validateJSON(res, true);

    validateSchema(z.union([z.array(z.string()), z.strictObject({ oveError: z.literal("Screen capture access denied") })]), data);
  }, SHORT_TIMEOUT);

  test("POST /browser/{browserId}/reload", async () => {
    const browsers = (await (await fetch(`${env["trpc-client-url"]}/getBrowsers?input={}`, auth)).json()).result.data;
    const browserId = Object.keys(browsers).at(0);
    expect(browserId).toBe("0");
    const res = await fetch(`${env["trpc-client-url"]}/reloadBrowser`, {
      ...auth,
      method: "POST",
      body: JSON.stringify({ browserId })
    });
    const data = await validateJSON(res, true);
    expect(data).toBe(true);
  });

  test("POST /browsers/reload", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/reloadBrowsers`, {
      ...auth,
      method: "POST",
      body: "{}"
    });
    const data = await validateJSON(res, true);
    expect(data).toBe(true);
  });

  test("browsers", async () => {
    await getBrowsers(`${env["trpc-client-url"]}/getBrowsers?input={}`, auth, true);
    await closeBrowsers(`${env["trpc-client-url"]}/closeBrowsers`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({})
    }, true);
    await delay(BROWSER_DELAY);
    await openBrowsers(`${env["trpc-client-url"]}/openBrowsers`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({})
    }, clientEnv["WINDOW_CONFIG"], true);
    await delay(BROWSER_DELAY);

    const res = await fetch(`${env["trpc-client-url"]}/openBrowsers`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({})
    });
    await delay(BROWSER_DELAY);
    await validateJSON(res, true);
  }, SHORT_TIMEOUT * 7 + BROWSER_DELAY * 5);

  test("GET /env/windowConfig", async () => {
    const config = (await (await fetch(`${env["trpc-client-url"]}/getWindowConfig?input={}`, auth)).json()).result.data;
    expect(config).toStrictEqual(clientEnv["WINDOW_CONFIG"]);
  }, SHORT_TIMEOUT);

  test("POST /env/windowConfig", async () => {
    const config = {
      "1": "https://www.google.com",
      "2": "https://www.google.com"
    };
    await fetch(`${env["trpc-client-url"]}/setWindowConfig`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ config })
    });
    expect(loadClientEnv(env)["WINDOW_CONFIG"]).toStrictEqual(config);
    const res = await fetch(`${env["trpc-client-url"]}/setWindowConfig`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ config: clientEnv["WINDOW_CONFIG"] })
    });
    await validateJSON(res, true);
  }, SHORT_TIMEOUT);

  afterEach(() => {
    saveClientEnv(env, clientEnv);
  });
});