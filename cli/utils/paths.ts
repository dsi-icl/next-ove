import os from "node:os";
import path from "node:path";

export const resolveFromRoot = (...segments: string[]): string => path.resolve(import.meta.dirname, "..", "..", ...segments);

export const resolveOutputPath = (
  provided: string | undefined,
  defaultPath: string,
  suffix?: string,
): string => {
  const base =
    provided === undefined
      ? defaultPath
      : provided.startsWith("~")
        ? path.join(os.homedir(), provided.slice(1))
        : provided;

  const absolute = path.isAbsolute(base)
    ? base
    : resolveFromRoot(base);

  return suffix ? path.join(absolute, suffix) : absolute;
};