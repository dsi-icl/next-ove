import { execSync } from "child_process";
import { SystemControl } from "./types";

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

export default (): SystemControl => ({
  shutdown,
  reboot,
  execute,
});
