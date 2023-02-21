import { execSync } from "child_process";
import { Display, SystemControl } from "../types";
import * as path from "path";
import * as fs from "fs";
import * as sc from "screenshot-desktop";
import "../../screenshot-desktop";

const isLinuxLike = () => ["linux", "darwin", "freebsd", "openbsd"].includes(process.platform);
const isWindows = () => process.platform === "win32";

const buildShutdownCommand = () => {
  if (isLinuxLike()) {
    return "shutdown -h now";
  } else if (isWindows()) {
    return "shutdown.exe /s /f";
  } else {
    throw Error("Unknown operating system");
  }
};

const shutdown = () => execSync(buildShutdownCommand());

const buildRebootCommand = () => {
  if (isLinuxLike()) {
    return "shutdown -r now";
  } else if (isWindows()) {
    return "shutdown.exe /r /f";
  } else {
    throw Error("Unknown operating system");
  }
};

const reboot = () => execSync(buildRebootCommand());

const execute = (command: string) => execSync(command);

const screenshot = async (method: string, screens: string[], format?: string): Promise<string[]> => {
  let displays = await sc.listDisplays();
  if (screens.length !== 0) {
    displays = displays.filter(({ name }: Display) => screens.includes(name));
  }

  if (displays.length === 0) {
    throw new Error("No displays with matching names found. To view available displays please use the /displays endpoint");
  }

  return await Promise.all(displays.map(async ({ id, name }: Display) => {
    let filename = null;
    let dir = null;
    if (method === "local") {
      dir = path.join(__dirname, "screenshots");

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      filename = `${name}-${new Date().toISOString()}.${format || "jpg"}`;
    }
    const image = await sc({
      screen: id,
      format: format,
      filename: dir !== null && filename !== null ? path.join(dir, filename) : undefined
    });

    if (method === "return") {
      return (image as Buffer).toString("base64url");
    } else if (method === "local") {
      return filename;
    }
  }));
};

export default (): SystemControl => ({
  shutdown,
  reboot,
  execute,
  screenshot
});
