import { BrowserControl } from "../../types";
import { exec } from "child_process";
import { handleExecOutput } from "../utils";

const openBrowser = () => {
  exec("nx run ove-client:serve", handleExecOutput);
};

const closeBrowser = () => {
  throw new Error();
};

const getBrowserStatus = (): string => {
  throw new Error();
};

const BrowserControl = (): BrowserControl => ({
  openBrowser,
  closeBrowser,
  getBrowserStatus
});

export default BrowserControl;
