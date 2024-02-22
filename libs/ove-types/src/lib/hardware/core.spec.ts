/* global readFile, LogFn, console, init,
Benchmark, formatOutput, __BENCHMARKS__ */

import { writeFileSync } from "fs";
import { type TCoreAPI } from "./core";
import { bench } from "@arktype/attest";

describe("core types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("getStatus", async () => {
    init();
    bench("getStatus", () => ({}) as TCoreAPI["getStatus"])
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getStatus"] = formatOutput(console.log as LogFn);
  });

  it("getStatusAll", async () => {
    init();
    bench("getStatusAll", () => ({}) as TCoreAPI["getStatusAll"])
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getStatusAll"] = formatOutput(console.log as LogFn);
  });

  it("getInfo", async () => {
    init();
    bench("getInfo", () => ({}) as TCoreAPI["getInfo"])
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getInfo"] = formatOutput(console.log as LogFn);
  });

  it("getInfoAll", async () => {
    init();
    bench("getInfoAll", () => ({}) as TCoreAPI["getInfoAll"])
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getInfoAll"] = formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"]!)) {
      existing["ove-types"]!["hardware/"] = {};
    }

    existing["ove-types"]!["hardware/"]!["core"] = benchmarks;
    writeFileSync(__BENCHMARKS__,
      JSON.stringify(existing, undefined, 2));
  });
});
