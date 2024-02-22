/* global readFile, LogFn, console, init,
Benchmark, formatOutput, __BENCHMARKS__ */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import { type TDeviceResponse } from "./client-transform";

describe("client-transform types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("TDeviceResponse", () => {
    init();
    bench("TDeviceResponse", () => ({}) as TDeviceResponse<string>)
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["TDeviceResponse"] = formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"]!)) {
      existing["ove-types"]!["hardware/"] = {};
    }

    existing["ove-types"]!["hardware/"]!["client-transform"] = benchmarks;
    writeFileSync(__BENCHMARKS__,
      JSON.stringify(existing, undefined, 2));
  });
});
