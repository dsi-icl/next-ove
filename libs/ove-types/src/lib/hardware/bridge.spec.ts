/* global readFile, LogFn, console, init,
Benchmark, formatOutput, __BENCHMARKS__ */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import { type TBridgeHardwareService } from "./bridge";

describe("bridge types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("hardware service - getStatus", () => {
    init();
    bench("hardware service - getStatus",
      () => ({}) as TBridgeHardwareService["getStatus"])
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getStatus"] = formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"]!)) {
      existing["ove-types"]!["hardware/"] = {};
    }

    existing["ove-types"]!["hardware/"]!["bridge"] = benchmarks;
    writeFileSync(__BENCHMARKS__,
      JSON.stringify(existing, undefined, 2));
  });
});
