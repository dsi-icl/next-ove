import { writeFileSync } from "fs";
import { type TCoreAPI } from "./core";
import { bench } from "@arktype/attest";
import Utils from "@ove/ove-server-utils";

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

describe("core types", () => {
  let benchmarks: Record<string, { time: number, instantiations: number }> = {};

  it("getStatus", async () => {
    init();
    bench("getStatus", () => ({}) as TCoreAPI["getStatus"]).mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getStatus"] = formatOutput();
  });

  it("getStatusAll", async () => {
    init();
    bench("getStatusAll", () => ({}) as TCoreAPI["getStatusAll"]).mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getStatusAll"] = formatOutput();
  });

  it("getInfo", async () => {
    init();
    bench("getInfo", () => ({}) as TCoreAPI["getInfo"]).mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getInfo"] = formatOutput();
  });

  it("getInfoAll", async () => {
    init();
    bench("getInfoAll", () => ({}) as TCoreAPI["getInfoAll"]).mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getInfoAll"] = formatOutput();
  });

  afterAll(() => {
    const existing = Utils.readFile<Record<string, any>>("./benchmarks.json", "{}")!;

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"])) existing["ove-types"]["hardware/"] = {};

    existing["ove-types"]["hardware/"]["core"] = benchmarks;
    writeFileSync("./benchmarks.json", JSON.stringify(existing, undefined, 2));
  });
});