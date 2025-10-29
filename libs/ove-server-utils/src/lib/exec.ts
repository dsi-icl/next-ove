import { exec } from "child_process";

export const execPromise = (cmd: string, options?: { timeout?: number }) =>
  new Promise<string>(function (resolve, reject) {
    const controller = new AbortController();
    exec(cmd, { signal: controller.signal }, function (err, stdout) {
      if (err) return reject(err);
      resolve(stdout);
    });
    if (options?.timeout !== undefined) {
      setTimeout(() => controller.abort(), options.timeout);
    }
  });
