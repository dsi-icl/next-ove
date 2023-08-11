import * as fs from "fs";
import * as path from "path";
import { readFileSync, writeFileSync } from "atomically";
import { Json } from "@ove/ove-utils";

export const readAsset = <T>(filename: string, defaultAsset: string | null = null) => readFile<T>(path.join(__dirname, "assets", filename), defaultAsset);

export const readFile = <T>(filePath: string, defaultAsset: string | null = null) => {
  if (!exists(filePath) && defaultAsset !== null) {
    writeFileSync(filePath, defaultAsset);
  }

  return Json.parse<T>(readFileSync(filePath).toString());
};

export const toAsset = (filename: string, obj: unknown, overwrite = true) =>
  safeWriteFile(
    path.join(__dirname, "assets", filename),
    Json.stringify(obj, undefined, 2),
    overwrite
  );

export const safeWriteFile = (path: string, data: string, overwrite: boolean) => {
  if (overwrite) {
    writeFileSync(path, data);
    return true;
  } else {
    const fileExists = exists(path);

    if (!fileExists) {
      writeFileSync(path, data);
    }

    return !fileExists;
  }
};

export const envPath = path.join(__dirname, ".env");

export const writeEnv = (env: object, overwrite = true) => {
  safeWriteFile(
    envPath,
    Object.keys(env)
      .map(k => `${k}=${Json.stringify(env[k as keyof typeof env])}`)
      .join("\n"),
    overwrite
  );
};

export const safeFileDelete = (path: string) => {
  const fileExists = exists(path);
  if (fileExists) {
    fs.unlinkSync(path);
  }
  return fileExists;
};

export const exists = (path: string) => {
  try {
    fs.statSync(path);
    return true;
  } catch (e) {
    return false;
  }
};
