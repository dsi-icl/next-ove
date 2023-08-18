import * as fs from "fs";
import { readFileSync, writeFileSync } from "atomically";
import { Json } from "@ove/ove-utils";

export const readFile = <T>(filePath: string, defaultAsset: string | null = null) => {
  if (!exists(filePath) && defaultAsset !== null) {
    writeFileSync(filePath, defaultAsset);
  }

  return Json.parse<T>(readFileSync(filePath).toString());
};

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
