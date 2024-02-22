/* global readFile, LogFn, console, init,
Benchmark, formatOutput, __BENCHMARKS__ */

import { writeFileSync } from "fs";
import * as Types from "./ove-types";
import { type OVEException } from "./ove-types";
import { bench } from "@arktype/attest";

describe("oveTypes", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("should work", () => {
    expect(Object.keys(Types).length).toBeGreaterThan(0);
  });

  it("OVEException", () => {
    init();
    bench("OVEException", () => ({}) as OVEException)
      .mean([0, "ns"])
      .types([0, "instantiations"]);
    benchmarks["OVEException"] =
      formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};

    existing["ove-types"]!["ove-types"] = benchmarks;
    writeFileSync(__BENCHMARKS__,
      JSON.stringify(existing, undefined, 2));
  });
});
