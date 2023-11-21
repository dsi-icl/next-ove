import { env, logger } from "../../env";
import { state } from "../state";

export default ({
  register: (pin: string, key: string) => {
    logger.info("POST /register - authenticating device");
    if (pin === state.pin && !env.AUTHORISED_CREDENTIALS.includes(key)) {
      env.AUTHORISED_CREDENTIALS.push(key);
    }
    return pin === state.pin;
  }
});
