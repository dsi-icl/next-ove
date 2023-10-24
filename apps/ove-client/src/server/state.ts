import { type Browser } from "@ove/ove-types";

type State = {
  browsers: Map<number, Browser>
  pin: string
  pinUpdateCallback: ((event: string, ...args: any[]) => void) | null
};

const generatePin = () => Array(4)
  .fill(0)
  .map(() => Math.floor(Math.random() * 10))
  .join("");

export const state: State = {
  browsers: new Map<number, Browser>(),
  pin: "initialising",
  pinUpdateCallback: null
};

export const updatePin = () => {
  state.pin = generatePin();
  if (state.pinUpdateCallback === null) throw new Error("Missing pin update callback");
  state.pinUpdateCallback(state.pin);
};