import { Browser, ID } from "@ove/ove-types";

type State = {
  browsers: { [browserId: ID]: Browser }
  pin: string
  pinUpdateCallback: ((event: string, ...args: any[]) => void) | null
};

const generatePin = () => Array(4)
  .fill(0)
  .map(() => Math.floor(Math.random() * 10))
  .join("");

export const state: State = {
  browsers: {},
  pin: "initialising",
  pinUpdateCallback: null
};

export const updatePin = () => {
  state.pin = generatePin();
  if (state.pinUpdateCallback === null) throw new Error("Missing pin update callback");
  state.pinUpdateCallback(state.pin);
};