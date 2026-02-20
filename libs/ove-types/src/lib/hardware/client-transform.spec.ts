/* global readFile, LogFn, console, init,
Benchmark, formatOutput, __BENCHMARKS__ */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import type { TClientRouteOutputTransformSchema } from "./client-transform";

describe("client-transform types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("TClientRouteOutputTransformSchema", () => {
    init();
    bench(
      "TClientRouteOutputTransformSchema",
      () => ({}) as TClientRouteOutputTransformSchema<"getStatus">,
    )
      .mean([0, "ns"])
      .types([0, "instantiations"]);
    benchmarks["TClientRouteOutputTransformSchema"] = formatOutput(console.log as LogFn);
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
