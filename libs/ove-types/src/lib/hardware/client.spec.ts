import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import Utils from "@ove/ove-server-utils";
import { type TDeviceResponse } from "./client";

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

describe("client types", () => {
  let benchmarks: Record<string, { time: number, instantiations: number }> = {};

  it("TDeviceResponse", () => {
    init();
    bench("TDeviceResponse", () => ({}) as TDeviceResponse<string>).mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["TDeviceResponse"] = formatOutput();
  });

  afterAll(() => {
    const existing = Utils.readFile<Record<string, any>>("./benchmarks.json", "{}")!;

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"])) existing["ove-types"]["hardware/"] = {};

    existing["ove-types"]["hardware/"]["client"] = benchmarks;
    writeFileSync("./benchmarks.json", JSON.stringify(existing, undefined, 2));
  });
});