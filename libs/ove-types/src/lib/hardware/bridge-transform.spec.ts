import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import Utils from "@ove/ove-server-utils";
import { getMultiDeviceResponseSchema } from "./bridge-transform";

const formatOutput = () => {
  const results = (console.log as ReturnType<typeof jest.fn>).mock.calls.map(x => x[0] as string).filter(o => o.includes("Result: ")).map(o => o.match(/Result: ([\d|.]+)/)![1]);
  return {
    time: parseFloat(results[0]),
    instantiations: parseInt(results[1])
  };
};

const init = () => {
  console.log = jest.fn();
  console.group = jest.fn();
  console.error = jest.fn();
};

describe("bridge-transform types", () => {
  let benchmarks: Record<string, { time: number, instantiations: number }> = {};

  it("getMultiDeviceResponseSchema", () => {
    init();
    bench("getMultiDeviceResponseSchema", () => ({}) as typeof getMultiDeviceResponseSchema).mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getMultiDeviceReponseSchema"] = formatOutput();
  });

  afterAll(() => {
    const existing = Utils.readFile<Record<string, any>>("./benchmarks.json", "{}")!;

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"])) existing["ove-types"]["hardware/"] = {};

    existing["ove-types"]["hardware/"]["bridge-transform"] = benchmarks;
    writeFileSync("./benchmarks.json", JSON.stringify(existing, undefined, 2));
  });
});