/* global readFile, LogFn, console, init,
Benchmark, formatOutput, __BENCHMARKS__ */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import { type TAPIRoutes } from "./service";

describe("service types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("getGeometry", () => {
    init();
    bench("getGeometry", () => ({}) as TAPIRoutes["getGeometry"])
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getGeometry"] = formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("bridge/" in existing["ove-types"]!)) {
      existing["ove-types"]!["bridge/"] = {};
    }

    existing["ove-types"]!["bridge/"]!["service"] = benchmarks;
    writeFileSync(__BENCHMARKS__,
      JSON.stringify(existing, undefined, 2));
  });
});
