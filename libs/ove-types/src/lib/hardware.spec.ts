/* global readFile, LogFn, console, init,
Benchmark, formatOutput, __BENCHMARKS__ */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import { type Optional } from "./hardware";

describe("hardware types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("Optional", () => {
    init();
    bench("Optional", () => ({}) as Optional<Record<string, unknown>>)
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["Optional"] = formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};

    existing["ove-types"]!["hardware"] = benchmarks;
    writeFileSync(__BENCHMARKS__,
      JSON.stringify(existing, undefined, 2));
  });
});
