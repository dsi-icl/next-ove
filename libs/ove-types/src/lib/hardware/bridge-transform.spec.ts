/* global readFile, LogFn, console, init, Benchmark, formatOutput */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import { getMultiDeviceResponseSchema } from "./bridge-transform";

describe("bridge-transform types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("getMultiDeviceResponseSchema", () => {
    init();
    bench("getMultiDeviceResponseSchema",
      () => ({}) as typeof getMultiDeviceResponseSchema)
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["getMultiDeviceReponseSchema"] =
      formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("hardware/" in existing["ove-types"]!)) {
      existing["ove-types"]!["hardware/"] = {};
    }

    existing["ove-types"]!["hardware/"]!["bridge-transform"] = benchmarks;
    writeFileSync("./benchmarks.json",
      JSON.stringify(existing, undefined, 2));
  });
});
