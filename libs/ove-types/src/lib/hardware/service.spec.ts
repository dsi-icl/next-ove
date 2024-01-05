import { bench } from "@arktype/attest";
import { writeFileSync, readFileSync, statSync } from "fs";
import { type RouteMethod, type TServiceRoutesSchema } from "./service";

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

describe("service types", () => {
  let benchmarks: Record<string, { time: number, instantiations: number }> = {};

  it("RouteMethod", async () => {
    init();
    bench("RouteMethod", () => "" as RouteMethod).mean([0, "ns"]).types([0, "instantiations"]);
    const {
      time,
      instantiations
    } = formatOutput();

    benchmarks["RouteMethod"] = { time, instantiations };

    expect(time).toBeLessThan(50);
    expect(instantiations).toBe(0);
  });

  it("getStatus", async () => {
    init();
    bench("getStatus", () => ({}) as TServiceRoutesSchema["getStatus"]).mean([0, "ns"]).types([0, "instantiations"]);
    const {
      time,
      instantiations
    } = formatOutput();

    benchmarks["getStatus"] = { time, instantiations };

    expect(time).toBeLessThan(50);
    expect(instantiations).toBeLessThan(33000);
  });

  afterAll(() => {
    let existing: Record<string, any>
    try {
      statSync("./benchmarks.json");
      existing = JSON.parse(readFileSync("./benchmarks.json").toString());
    } catch (e) {
      console.error(e);
      existing = {};
    }

    if (!("ove-types" in existing)) {
      existing["ove-types"] = {};
    }
    existing["ove-types"]["service"] = benchmarks;
    writeFileSync("./benchmarks.json", JSON.stringify(existing, undefined, 2));
  });
});