/* global readFile, LogFn, console, init, Benchmark, formatOutput */

import { writeFileSync } from "fs";
import { bench } from "@arktype/attest";
import { type File } from "./projects";

describe("projects types", () => {
  const benchmarks: Record<string, Benchmark> = {};

  it("File", () => {
    init();
    bench("File", () => ({}) as File)
      .mean([0, "ns"]).types([0, "instantiations"]);
    benchmarks["File"] = formatOutput(console.log as LogFn);
  });

  afterAll(() => {
    const existing = readFile();

    if (!("ove-types" in existing)) existing["ove-types"] = {};
    if (!("projects/" in existing["ove-types"]!)) {
      existing["ove-types"]!["projects/"] = {};
    }

    existing["ove-types"]!["projects/"]!["projects"] = benchmarks;
    writeFileSync("./benchmarks.json",
      JSON.stringify(existing, undefined, 2));
  });
});
