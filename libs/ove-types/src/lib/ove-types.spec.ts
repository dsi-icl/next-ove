/* global readFile, LogFn, console, init,
Benchmark, formatOutput, __BENCHMARKS__ */

import { writeFileSync } from "fs";
import * as Types from "./ove-types";

describe("oveTypes", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("should work", () => {
    expect(Object.keys(Types).length).toBeGreaterThan(0);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};

    existing["ove-types"]!["ove-types"] = benchmarks;
    writeFileSync(__BENCHMARKS__,
      JSON.stringify(existing, undefined, 2));
  });
});
