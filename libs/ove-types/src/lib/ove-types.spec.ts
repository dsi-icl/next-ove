import { writeFileSync } from "fs";
import * as Types from "./ove-types";
import { bench } from "@arktype/attest";
import Utils from "@ove/ove-server-utils";
import { type OVEException } from "./ove-types";

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

describe("oveTypes", () => {
  let benchmarks: Record<string, { time: number, instantiations: number }> = {};

  it("should work", () => {
    expect(Object.keys(Types).length).toBeGreaterThan(0);
  });

  it("OVEException", () => {
    init();
    bench("OVEException", () => ({}) as OVEException).mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["OVEException"] = formatOutput();
  });

  afterAll(() => {
    const existing = Utils.readFile<Record<string, any>>("./benchmarks.json", "{}")!;

    if (!("ove-types" in existing)) existing["ove-types"] = {};

    existing["ove-types"]["ove-types"] = benchmarks;
    writeFileSync("./benchmarks.json", JSON.stringify(existing, undefined, 2));
  });
});
