import { BrowserControl } from "../../types";

const load = () => {
  throw new Error();
};

const kill = () => {
  throw new Error();
};

const browserStatus = (): string => {
  throw new Error();
};

const BrowserControl = (): BrowserControl => ({
  load,
  kill,
  status: browserStatus
});

export default BrowserControl;
