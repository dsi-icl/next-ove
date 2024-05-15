import fetch from "node-fetch";
import { readFileSync } from "atomically";
import path from "path";

type Env = {
  "base-core-url": string
}

const ENVIRONMENT = "dev";
const OK = 200;

const initEnv = () => (JSON.parse(readFileSync(path.join(__dirname, "private.env.json")).toString()) as Record<string, Env>)[ENVIRONMENT];

describe("Basic functionality", () => {
  const env: { "base-core-url": string } = initEnv();

  test("OpenAPI specification available", async () => {
    const res = await fetch(env["base-core-url"]);

    expect(res.status).toBe(OK);
    expect(res.headers.get("content-type")).toContain("text/html");

    const text = await res.text();
    expect(text).not.toBe("");
  });
});