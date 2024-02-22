/* global NodeJS */

import { env } from "../env";
import { type Browser } from "@ove/ove-types";

type State = {
  browsers: Map<number, Browser>
  pin: string
  pinUpdateCallback: ((event: string) => void) | null
  pinUpdateHandler: NodeJS.Timeout | null
  authErrors: number
};

const generatePin = () => env.AUTHORISED_CREDENTIALS === undefined ? Array(4)
  .fill(0)
  .map(() => Math.floor(Math.random() * 10))
  .join("") : "";

export const state: State = {
  browsers: new Map<number, Browser>(),
  pin: "initialising",
  pinUpdateCallback: null,
  pinUpdateHandler: null,
  authErrors: 0
};

export const updatePin = env.AUTHORISED_CREDENTIALS === undefined ? () => {
  state.pin = generatePin();
  if (state.pinUpdateCallback === null) {
    throw new Error("Missing pin update callback");
  }
  state.pinUpdateCallback(state.pin);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
} : null;
