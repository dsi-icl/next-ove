import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import Utils from "@ove/ove-server-utils";
import { type ToSingleRoute } from "./core-transform";

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

describe("core-transform types", () => {
  let benchmarks: Record<string, { time: number, instantiations: number }> = {};

  it("ToSingleRoute", () => {
    init();
    bench("ToSingleRoute", () => "" as ToSingleRoute<"getStatusAll">).mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["ToSingleRoute"] = formatOutput();
  });

  afterAll(() => {
    const existing = Utils.readFile<Record<string, any>>("./benchmarks.json", "{}")!;

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"])) existing["ove-types"]["hardware/"] = {};

    existing["ove-types"]["hardware/"]["core-transform"] = benchmarks;
    writeFileSync("./benchmarks.json", JSON.stringify(existing, undefined, 2));
  });
});