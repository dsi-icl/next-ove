import { Json } from "@ove/ove-utils";
import { readFile, safeWriteFile } from "@ove/file-utils";

export const updateConfig = (configPath: string, defaultConfig: object, expectedKeys: string[]): {
  rawConfig: object,
  isUpdate: boolean
} => {
  let isUpdate = false;
  const rawConfig = readFile<Record<string, unknown>>(configPath, Json.stringify(defaultConfig, undefined, 2));

  for (let key of Object.keys(defaultConfig)) {
    if (key in rawConfig) continue;
    isUpdate = true;
    rawConfig[key as keyof typeof defaultConfig] = defaultConfig[key as keyof typeof defaultConfig];
  }

  for (let key of Object.keys(rawConfig)) {
    if (expectedKeys.includes(key)) continue;
    isUpdate = true;
    delete rawConfig[key];
  }

  return {
    rawConfig,
    isUpdate
  };
};

export const saveConfig = <T extends Record<string, unknown>>(configPath: string, updatedEnv: T, excludeKeys: string[]) => {
  const excludedEnv = {} as T;
  (Object.keys(updatedEnv) as Array<keyof T>).forEach(k => {
    if (excludeKeys.includes(k as string)) return;
    excludedEnv[k] = updatedEnv[k];
  });

  safeWriteFile(configPath, Json.stringify(excludedEnv), true);
};