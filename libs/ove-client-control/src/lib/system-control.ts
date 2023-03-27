import { execSync } from "child_process";

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

const shutdown = () => {
  try {
    execSync(buildShutdownCommand());
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const buildRebootCommand = () => {
  if (isLinuxLike()) {
    return "shutdown -r now";
  } else if (isWindows()) {
    return "shutdown.exe /r /f";
  } else {
    throw Error("Unknown operating system");
  }
};

const reboot = () => {
  try {
    execSync(buildRebootCommand());
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const execute = (command: string) => {
  const response = execSync(command).toString();
  return {response};
}

export default () => ({
  shutdown,
  reboot,
  execute,
});
