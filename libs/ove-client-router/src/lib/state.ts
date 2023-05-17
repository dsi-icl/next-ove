import { Browser, ID } from "@ove/ove-types";
import { readAsset } from "@ove/file-utils";

type State = {
  browsers: { [browserId: ID]: Browser }
  authorisedCredentials: string[]
  pin: string
  pinUpdateCallback: ((event: string, ...args: any[]) => void) | null
};

const generatePin = () => Array(4)
  .fill(0)
  .map(() => Math.floor(Math.random() * 10))
  .join("");

export const state: State = {
  browsers: {},
  authorisedCredentials: readAsset("credentials.json", JSON.stringify([])),
  pin: "initialising",
  pinUpdateCallback: null
};

export const updatePin = () => {
  state.pin = generatePin();
  if (state.pinUpdateCallback === null) throw new Error("Missing pin update callback");
  state.pinUpdateCallback(state.pin);
};