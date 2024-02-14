/* global clearInterval */

import { state } from "../state";
import { env, logger } from "../../env";

const controller = {
  register: (pin: string, key: string, url: string) => {
    logger.info("POST /register - authenticating device");

    if (state.authErrors <= env.AUTH_ERROR_LIMIT &&
      pin === state.pin && env.AUTHORISED_CREDENTIALS === undefined) {
      env.AUTHORISED_CREDENTIALS = key;
      env.BRIDGE_URL = url;
    }

    if (state.pinUpdateHandler !== null) {
      clearInterval(state.pinUpdateHandler);
    }
    state.pin = "";
    state.pinUpdateCallback = null;
    state.pinUpdateHandler = null;

    return pin === state.pin;
  }
};

export default controller;
