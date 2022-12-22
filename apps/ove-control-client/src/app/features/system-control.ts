import { exec } from "child_process";
import { SystemControl } from "../../types";
import { handleExecOutput } from "../utils";
import * as path from "path";
import * as fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as takeScreenshot from "screenshot-desktop";

const isLinuxLike = () => ['linux', 'darwin', 'freebsd', 'openbsd'].includes(process.platform);
const isWindows = () => process.platform === 'win32';

const buildShutdownCommand = () => {
  if (isLinuxLike()) {
    return "shutdown -h now";
  } else if (isWindows()) {
    return "shutdown.exe /s /f";
  } else {
    throw Error("Unknown operating system");
  }
};

const shutdown = () => setTimeout(() => exec(buildShutdownCommand(), handleExecOutput), 1000);

const buildRebootCommand = () => {
  if (isLinuxLike()) {
    return "shutdown -r now";
  } else if (isWindows()) {
    return "shutdown.exe /r /f";
  } else {
    throw Error("Unknown operating system");
  }
};

const reboot = () => setTimeout(() => exec(buildRebootCommand(), handleExecOutput), 1000);

const execute = (command, callback) => exec(command, (err, stdout, stderr) => handleExecOutput(err, stdout, stderr, callback));

const screenshot = async (method: string, screens: string[], format?: string) => {
  let displays = await takeScreenshot.listDisplays();
  if (screens.length !== 0) {
    displays = displays.filter(({name}) => screens.includes(name));
  }

  return await Promise.all(displays.map(async ({id, name}) => {
    let filename = null;
    let dir = null;
    if (method === "local") {
      dir = path.join(__dirname, "screenshots");

      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      filename = `${name}-${new Date().toISOString()}.${format || 'jpg'}`;
    }
    const image = await takeScreenshot({screen: id, format: format, filename: path.join(dir, filename)});

    if (method === "http") {
      return (image as Buffer).toString("base64url");
    } else if (method === "local") {
      return filename;
    }
  }));
};


const SystemControl = (): SystemControl => ({
  shutdown,
  reboot,
  execute,
  screenshot
});

export default SystemControl;
