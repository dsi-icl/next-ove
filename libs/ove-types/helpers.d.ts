/* global jest */

declare const __BENCHMARKS__: string;

declare type Benchmark = {
  instantiations: number
  time: number
};

declare type LogFn = ReturnType<typeof jest.fn>;

declare function init(): void;

declare function formatOutput(log: LogFn): Benchmark;

declare function readFile(): BenchmarkEntries;

declare type BenchmarkEntries = {
  "ove-types"?: {
    "ove-types"?: Record<string, Benchmark>
    "hardware/"?: {
      bridge?: Record<string, Benchmark>
      "bridge-transform"?: Record<string, Benchmark>
      client?: Record<string, Benchmark>
      "client-transform"?: Record<string, Benchmark>
      core?: Record<string, Benchmark>
      "core-transform"?: Record<string, Benchmark>
      service?: Record<string, Benchmark>
    },
    hardware?: Record<string, Benchmark>
    "bridge/"?: {
      service?: Record<string, Benchmark>
    }
    "projects/"?: {
      projects?: Record<string, Benchmark>
    }
  }
}
