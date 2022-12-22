import { BrowserControl } from "../../types";
import { exec } from "child_process";
import { handleExecOutput } from "../utils";

type Browser = {
  controller: AbortController
};

const browsers: {[browserId: number]: Browser} = {};

const addBrowser = (browserId: number) => {
  browsers[browserId] = {
    controller: new AbortController()
  };
};

const removeBrowser = (browserId: number) => {
  browsers[browserId].controller.abort();
  delete browsers[browserId];
};

const openBrowser = (): number => {
  const browserId = Object.keys(browsers).length;
  addBrowser(browserId);
  exec(`nx run ove-client:serve --args="--id=${browserId}"`, {signal: browsers[browserId].controller.signal}, handleExecOutput);
  return browserId;
};

const closeBrowser = removeBrowser;

const getBrowserStatus = (browserId: number): string => {
  if (Object.keys(browsers).includes(browserId.toString())) {
    return "open";
  } else {
    return "closed";
  }
};

const getBrowsers = (): number[] => Object.keys(browsers).map(parseInt);
const closeBrowsers = () => Object.keys(browsers).forEach(key => removeBrowser(parseInt(key)));

const BrowserControl = (): BrowserControl => ({
  openBrowser,
  closeBrowser,
  getBrowserStatus,
  getBrowsers,
  closeBrowsers
});

export default BrowserControl;
