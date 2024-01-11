/* global readFile, LogFn, console, init, Benchmark, formatOutput */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import { type ToSingleRoute } from "./core-transform";

describe("core-transform types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("ToSingleRoute", () => {
    init();
    bench("ToSingleRoute", () => "" as ToSingleRoute<"getStatusAll">)
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["ToSingleRoute"] =
      formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"]!)) {
      existing["ove-types"]!["hardware/"] = {};
    }

    existing["ove-types"]!["hardware/"]!["core-transform"] = benchmarks;
    writeFileSync("./benchmarks.json",
      JSON.stringify(existing, undefined, 2));
  });
});
