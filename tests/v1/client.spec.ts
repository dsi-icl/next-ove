import { readFileSync } from "atomically";
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
import { z, ZodTypeAny } from "zod";

const ENVIRONMENT = "dev";
const SKIP_POWER = true;
const SHORT_TIMEOUT = 10_000;
const OK = 200;

const initEnv = () => JSON.parse(readFileSync(path.join(__dirname, "private.env.json")).toString())[ENVIRONMENT];

const validateBrowser = (data: unknown) => {
  validateSchema(z.strictObject({
    displayId: z.number(),
    windowId: z.string(),
    url: z.string()
  }), data);
  expect((data as { url: string }).url).toBe("https://ove.readthedocs.io");
  expect((data as { displayId: number }).displayId).toBe(1);
};

const validateJSON = async (res: NodeResponse, isTRPC = false): Promise<unknown> => {
  expect(res.status).toBe(OK);
  expect(res.headers.get("Content-Type")).toBe("application/json");
  return !isTRPC ? res.json() : (await res.json()).result.data.json;
};

const validateSchema = <T>(schema: ZodTypeAny, data: T) => {
  expect(schema.safeParse(data).success).toBe(true);
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
  let env: { "rest-client-url": string, token: string } = initEnv();
  const auth = { headers: { Authorization: `Basic ${env.token}` } };
  let browserId: number;

  test("GET /status", async () => {
    const res = await fetch(`${env["rest-client-url"]}/status`, auth);
    const data = await validateJSON(res);

    expect(data).toBe(true);
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

    validateSchema(z.array(z.string()), data);
  }, SHORT_TIMEOUT);

  test("GET /browsers", async () => {
    const res = await fetch(`${env["rest-client-url"]}/browsers`, auth);
    const data = await validateJSON(res);

    expect(data).toStrictEqual({});
  }, SHORT_TIMEOUT);

  test("DELETE /browsers", async () => {
    const res = await fetch(`${env["rest-client-url"]}/browsers`, {
      ...auth,
      method: "DELETE"
    });
    const data = await validateJSON(res);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("POST /browser", async () => {
    const res = await fetch(`${env["rest-client-url"]}/browser`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ url: "https://ove.readthedocs.io", displayId: 1 })
    });
    const data = await validateJSON(res);

    expect(data).toBe(0);

    browserId = data as number;
  }, SHORT_TIMEOUT);

  test("GET /browser/:browserId", async () => {
    const res = await fetch(`${env["rest-client-url"]}/browser/${browserId}`, auth);
    const data = await validateJSON(res);
    validateBrowser(data);
  }, SHORT_TIMEOUT);

  test("DELETE /browser/:browserId", async () => {
    const res = await fetch(`${env["rest-client-url"]}/browser/${browserId}`, {
      ...auth,
      method: "DELETE"
    });
    const data = await validateJSON(res);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);
});

describe("tRPC API", () => {
  let env: { "trpc-client-url": string, token: string } = initEnv();
  const auth = { headers: { Authorization: `Basic ${env.token}` } };
  let browserId: number;

  test("getStatus", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getStatus?input={"json": {}}`, auth);
    const data = await validateJSON(res, true);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("getInfo - default", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - invalid", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "invalid"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - general", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "general"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(GeneralSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - system", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "system"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(SystemSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - cpu", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "cpu"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(CPUSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - memory", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "memory"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(MemorySchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - battery", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "battery"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(BatterySchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - graphics", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "graphics"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(GraphicsSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - os", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "os"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(OSSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - processes", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "processes"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(ProcessesSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - fs", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "fs"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(FSSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - usb", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "usb"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(USBSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - printer", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "printer"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(PrinterSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - audio", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "audio"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(AudioSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - network", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "network"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(NetworkSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - wifi", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "wifi"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(WifiSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - bluetooth", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "bluetooth"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(BluetoothSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - docker", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "docker"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(DockerSchema, data);
  }, SHORT_TIMEOUT);

  test("getInfo - vbox", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getInfo?input={"json": {"type": "vbox"}}`, auth);
    const data = await validateJSON(res, true);
    validateSchema(VboxSchema, data);
  }, SHORT_TIMEOUT);

  test("shutdown", async () => {
    if (SKIP_POWER) return;
    const res = await fetch(`${env["trpc-client-url"]}/shutdown`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ json: {} })
    });
    const data = await validateJSON(res, true);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("reboot", async () => {
    if (SKIP_POWER) return;
    const res = await fetch(`${env["trpc-client-url"]}/reboot`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ json: {} })
    });
    const data = await validateJSON(res, true);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("execute", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/execute`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ json: { command: "echo hello world" } })
    });
    const data = await validateJSON(res, true);

    validateSchema(z.strictObject({ response: z.string() }), data);
    expect((data as { response: string }).response).toBe("hello world\n");
  }, SHORT_TIMEOUT);

  test("screenshot", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/screenshot`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ json: { method: "response", screens: [1] } })
    });
    const data = await validateJSON(res, true);

    validateSchema(z.array(z.string()), data);
  }, SHORT_TIMEOUT);

  test("getBrowsers", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getBrowsers?input={"json": {}}`, auth);
    const data = await validateJSON(res, true);

    validateSchema(z.array(z.array(z.union([z.number(), z.strictObject({
      displayId: z.number(),
      url: z.string(),
      windowId: z.string()
    })]))), data);
  }, SHORT_TIMEOUT);

  test("closeBrowsers", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/closeBrowsers`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ json: {} })
    });
    const data = await validateJSON(res, true);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);

  test("openBrowser", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/openBrowser`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        json: {
          url: "https://ove.readthedocs.io",
          displayId: 1
        }
      })
    });
    const data = await validateJSON(res, true);

    expect(data).toBe(0);

    browserId = data as number;
  }, SHORT_TIMEOUT);

  test("getBrowser", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/getBrowser?input={"json": {"browserId": ${browserId}}}`, auth);
    const data = await validateJSON(res, true);
    validateBrowser(data);
  }, SHORT_TIMEOUT);

  test("closeBrowser", async () => {
    const res = await fetch(`${env["trpc-client-url"]}/closeBrowser`, {
      headers: { ...auth.headers, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ json: { browserId } })
    });
    const data = await validateJSON(res, true);

    expect(data).toBe(true);
  }, SHORT_TIMEOUT);
});