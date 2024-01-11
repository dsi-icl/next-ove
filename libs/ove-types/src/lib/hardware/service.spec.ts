/* global readFile, LogFn, console, init, Benchmark, formatOutput */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import { type RouteMethod, type TServiceRoutesSchema } from "./service";

describe("service types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("RouteMethod", async () => {
    init();
    bench("RouteMethod", () => "" as RouteMethod)
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["RouteMethod"] = formatOutput(console.log as LogFn);
  });

  it("getStatus", async () => {
    init();
    bench("getStatus",
      () => ({}) as TServiceRoutesSchema["getStatus"])
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getStatus"] = formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"]!)) {
      existing["ove-types"]!["hardware/"] = {};
    }

    existing["ove-types"]!["hardware/"]!["service"] = benchmarks;
    writeFileSync("./benchmarks.json",
      JSON.stringify(existing, undefined, 2));
  });
});
