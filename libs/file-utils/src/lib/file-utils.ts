import * as fs from "fs";
import * as path from "path";

export const readAsset = <T>(filename: string, defaultAsset: string | null = null) => {
  const file = path.join(__dirname, "assets", filename);

  if (!exists(file) && defaultAsset !== null) {
    fs.writeFileSync(file, defaultAsset);
  }

  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "assets", filename)).toString()
  ) as T;
};

export const toAsset = (filename: string, obj: unknown, overwrite = true) =>
  safeWriteFile(
    path.join(__dirname, "assets", filename),
    JSON.stringify(obj, null, 2),
    overwrite
  );

export const safeWriteFile = (path: string, data: string, overwrite: boolean) => {
  if (overwrite) {
    fs.writeFileSync(path, data);
    return true;
  } else {
    const fileExists = exists(path);

    if (!fileExists) {
      fs.writeFileSync(path, data);
    }

    return !fileExists;
  }
};

export const envPath = path.join(__dirname, ".env");

export const writeEnv = (env: object, overwrite = true) => {
  safeWriteFile(
    envPath,
    Object.keys(env)
      .map(k => `${k}=${JSON.stringify(env[k as keyof typeof env])}`)
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
