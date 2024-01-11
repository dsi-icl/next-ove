// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { DeepProxy, Json } from "@ove/ove-utils";
import { readFile, safeWriteFile } from "./ove-file-utils";
import { z } from "zod";

const updateConfig = (
  configPath: string,
  defaultConfig: object,
  expectedKeys: string[]
): {
  rawConfig: object,
  isUpdate: boolean
} | null => {
  let isUpdate = false;
  const rawConfig = readFile<Record<string, unknown>>(
    configPath, Json.stringify(defaultConfig, undefined, 2));
  if (rawConfig === null) return null;

  for (const key of Object.keys(defaultConfig)) {
    if (key in rawConfig) continue;
    isUpdate = true;
    rawConfig[key as keyof typeof defaultConfig] =
      defaultConfig[key as keyof typeof defaultConfig];
  }

  for (const key of Object.keys(rawConfig)) {
    if (expectedKeys.includes(key)) continue;
    isUpdate = true;
    delete rawConfig[key];
  }

  return {
    rawConfig,
    isUpdate
  };
};

const saveConfig = <T extends Record<string, unknown>>(
  configPath: string,
  updatedEnv: T,
  excludeKeys: string[]
) => {
  const excludedEnv = {} as T;
  (Object.keys(updatedEnv) as Array<keyof T>).forEach(k => {
    if (excludeKeys.includes(k as string)) return;
    excludedEnv[k] = updatedEnv[k];
  });

  safeWriteFile(configPath, Json.stringify(excludedEnv), true);
};

export const setupConfigWithRefinement =
  <T extends object, U extends z.ZodRawShape, V extends object>(
    configPath: string,
    defaultConfig: T,
    schema: z.ZodObject<U, "strict"> | z.ZodEffects<z.ZodObject<U, "strict">>,
    staticConfig: V,
    keys: string[]
  ) => {
    const config = updateConfig(
      configPath,
      defaultConfig,
      keys
    );

    if (config === null) throw new Error("Error retrieving configuration");
    const { rawConfig, isUpdate } = config;

    type Environment = z.infer<typeof schema> & V

    const env: Environment = DeepProxy({
      ...schema.parse(rawConfig),
      ...staticConfig
    }, () => saveConfig(configPath, Json.copy(env), Object.keys(staticConfig)));

    if (isUpdate) {
      saveConfig(configPath, env, Object.keys(staticConfig));
    }

    return env;
  };

export const setupConfig =
  <T extends object, U extends z.ZodRawShape, V extends object>(
    configPath: string,
    defaultConfig: T,
    schema: z.ZodObject<U, "strict">,
    staticConfig: V
  ) => setupConfigWithRefinement(
    configPath,
    defaultConfig,
    schema,
    staticConfig,
    Object.keys(schema.shape)
  );
