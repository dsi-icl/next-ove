import { BrowserControl } from "../../types";
import { exec } from "child_process";
import { handleExecOutput } from "../utils";
import { state } from "../state";

export const addBrowser = (browserId: number) => {
  state.browsers[browserId] = {
    controller: new AbortController()
  };
};

export const removeBrowser = (browserId: number) => {
  state.browsers[browserId].controller.abort();
  delete state.browsers[browserId];
};

const openBrowser = (): number => {
  const browserId = Object.keys(state.browsers).length;
  addBrowser(browserId);
  exec(`nx run ove-client:serve --args="--id=${browserId}"`, { signal: state.browsers[browserId].controller.signal }, handleExecOutput);
  return browserId;
};

const closeBrowser = removeBrowser;

const getBrowserStatus = (browserId: number): { status: string } => {
  if (Object.keys(state.browsers).includes(browserId.toString())) {
    return { status: "open" };
  } else {
    return { status: "closed" };
  }
};

const getBrowsers = (): number[] => Object.keys(state.browsers).map(parseInt);
const closeBrowsers = () => Object.keys(state.browsers).forEach(key => removeBrowser(parseInt(key)));

export default (): BrowserControl => ({
  openBrowser,
  closeBrowser,
  getBrowserStatus,
  getBrowsers,
  closeBrowsers
});
