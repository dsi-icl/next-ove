import { exec } from "child_process";
import { SystemControl } from "../types";
import {logger} from "./utils";
import takeScreenshot, {listDisplays} from "screenshot-desktop";

const isLinuxLike = () => ['linux', 'darwin', 'freebsd', 'openbsd'].includes(process.platform);
const isWindows = () => process.platform === 'win32';
const handleExecOutput = (err, stdout, stderr, callback?) => {
  if (err) {
    logger.error(err.message);
    callback(err.message);
    return;
  }

  if (stderr) {
    logger.error(stderr);
    callback(stderr);
    return;
  }

  logger.info(stdout);
  callback(stdout);
};

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

const screenshot = async (callback: (Buffer) => void, screens: string[], format?: string) => {
  let displays = await listDisplays();
  if (screens.length !== 0) {
    displays = displays.filter(({name}) => screens.includes(name));
  }

  displays.forEach(({id}) => takeScreenshot({screen: id, format: format}))
};


const SystemControl = (): SystemControl => ({
  shutdown,
  reboot,
  execute,
  screenshot
});

export default SystemControl;
