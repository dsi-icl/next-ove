import {Logging} from "@ove/ove-utils";

export const logger = Logging.Logger("ove-control-client");

export const handleExecOutput = (err, stdout, stderr, callback?) => {
  if (err) {
    logger.error(err.message);
    callback?.(err.message);
    return;
  }

  if (stderr) {
    logger.error(stderr);
    callback?.(stderr);
    return;
  }

  logger.info(stdout);
  callback?.(stdout);
};
