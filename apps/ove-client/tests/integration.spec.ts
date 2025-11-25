import axios from "axios";

const baseURL = "http://localhost:3334/api/v1";
const token = process.env.API_TOKEN || "your-token-here";

console.log("Using API token:", token);

const client = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

describe("next-ove client API - Full Integration Suite", () => {
  let lastBrowsers: Record<string, any> = {};
  let browserConfig: string[] = [];

  beforeAll(async () => {
    console.log("Starting next-ove API integration tests…");
  });

  /** ----------------------------
   * STATUS
   * ---------------------------- */
  test("GET /status should return a valid status enum", async () => {
    const response = await client.get("/status");
    expect(response.status).toBe(200);
    expect(["off", "on", "ARP", "SYN", "PING"]).toContain(response.data);
    console.log("Status:", response.data);
  });

  /** ----------------------------
   * INFO
   * ---------------------------- */
  test("GET /info should return a valid object or empty response", async () => {
    const response = await client.get("/info");
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    console.log("Info data:", response.data);
  });

  /** ----------------------------
   * BROWSERS
   * ---------------------------- */
  test("GET /browsers should return available browsers", async () => {
    const response = await client.get("/browsers");
    expect(response.status).toBe(200);
    lastBrowsers = response.data;
    console.log("Browsers:", lastBrowsers);

    Object.values(lastBrowsers).forEach((browser: any) => {
      expect(browser).toHaveProperty("displayId");
      expect(typeof browser.displayId).toBe("number");
      if (browser.url) expect(typeof browser.url).toBe("string");
    });
  });

  /** ----------------------------
   * TOGGLE BROWSERS (open/close)
   * ---------------------------- */
  test("Toggle browsers depending on current state", async () => {
    // If currently open, close them; else open them.
    const shouldClose = Object.keys(lastBrowsers).length > 0;
    if (shouldClose) {
      const close = await client.delete("/browsers");
      expect(close.status).toBe(200);
      expect(typeof close.data).toBe("boolean");
      console.log("Browsers closed:", close.data);
      const open = await client.post("/browsers", {});
      expect(open.status).toBe(200);
      expect(Array.isArray(open.data)).toBe(true);
      console.log("Browsers opened:", open.data);
    } else {
      const open = await client.post("/browsers", {});
      expect(open.status).toBe(200);
      expect(Array.isArray(open.data)).toBe(true);
      console.log("Browsers opened:", open.data);
      const close = await client.delete("/browsers");
      expect(close.status).toBe(200);
      expect(typeof close.data).toBe("boolean");
      console.log("Browsers closed:", close.data);
    }

    // Check resulting new state:
    const verify = await client.get("/browsers");
    expect(verify.status).toBe(200);
    console.log("Browsers after toggle:", verify.data);
  });

  /** ----------------------------
   * GET & SET BROWSER CONFIG
   * ---------------------------- */
  test("GET & reapply browser config", async () => {
    const getConfig = await client.get("/browsers/config");
    expect(getConfig.status).toBe(200);
    expect(Array.isArray(getConfig.data)).toBe(true);
    browserConfig = getConfig.data;
    console.log("Existing browser config:", browserConfig);

    const setConfig = await client.post("/browsers/config", {
      config: browserConfig,
    });
    expect(setConfig.status).toBe(200);
    expect(typeof setConfig.data).toBe("boolean");
    console.log("Re-applied browser config:", setConfig.data);
  });

  /** ----------------------------
   * RELOAD BROWSERS
   * ---------------------------- */
  test("POST /browsers/reload should succeed", async () => {
    const response = await client.post("/browsers/reload", {});
    expect(response.status).toBe(200);
    expect(typeof response.data).toBe("boolean");
    console.log("Browsers reloaded:", response.data);
  });

  /** ----------------------------
   * EXECUTE COMMAND
   * ---------------------------- */
  test("POST /execute should echo 'hello world'", async () => {
    const payload = { command: "echo hello world" };
    const response = await client.post("/execute", payload);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("response");
    expect(typeof response.data.response).toBe("string");
    console.log("Execute response:", response.data.response);
  });

  /** ----------------------------
   * SCREENSHOTS
   * ---------------------------- */
  test("POST /screenshot (method=response) should return an array of strings", async () => {
    const payload = { method: "response" };
    const response = await client.post("/screenshot", payload);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    response.data.forEach((item: string) =>
      expect(typeof item).toBe("string")
    );
    console.log("Screenshots returned:", response.data.length);
  });

  /** ----------------------------
   * RELOAD SPECIFIC BROWSER (if available)
   * ---------------------------- */
  test("POST /browsers/{browserId}/reload should reload one browser if present", async () => {
    const browsers = await client.get("/browsers");
    // const browsers = Object.keys(lastBrowsers);
    console.log("Available browsers:", browsers.data);
    // if (browsers.length === 0)
    //   return console.log("No browsers to reload individually.");

    const browserId = 2;
    const response = await client.post(`/browsers/${browserId}/reload`);
    expect(response.status).toBe(200);
    expect(typeof response.data).toBe("boolean");
    console.log(`Browser ${browserId} reloaded.`);
  });
});