import * as fs from "fs";
import * as path from "path";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Json } from "@ove/ove-utils";
import { readFileSync, writeFileSync } from "atomically";

export const readFile = <T extends NonNullable<object | string | number>>(
  filePath: string,
  defaultAsset: string | null = null
): T | null => {
  try {
    if (!exists(filePath) && defaultAsset !== null) {
      writeFileSync(filePath, defaultAsset);
    }

    return Json.parse<T>(readFileSync(filePath).toString());
  } catch (_e) {
    return null;
  }
};

export const safeWriteFile = (
  path: string,
  data: string,
  overwrite: boolean
): boolean | null => {
  if (overwrite) {
    try {
      writeFileSync(path, data);
      return true;
    } catch (_e) {
      return null;
    }
  } else {
    const fileExists = exists(path);

    if (!fileExists) {
      try {
        writeFileSync(path, data);
      } catch (_e) {
        return null;
      }
    }

    return !fileExists;
  }
};

export const safeFileDelete = (path: string): boolean | null => {
  const fileExists = exists(path);
  if (fileExists) {
    try {
      fs.unlinkSync(path);
    } catch (_e) {
      return null;
    }
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

export const saveSwagger = (filename: string, swagger: object) => {
  safeWriteFile(
    path.join("docs", "api", filename),
    Json.stringify(swagger, undefined, 2),
    true
  );
};
