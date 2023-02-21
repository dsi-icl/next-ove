import {Logging} from "@ove/ove-utils";
import { ExecException } from "child_process";

export const logger = Logging.Logger("ove-control-client");

export const handleExecOutput = (err: ExecException | null, stdout: string | Buffer, stderr: string | Buffer, callback?: (message: any) => void) => {
  if (err) {
    logger.error(err.message);
    callback?.(err.message);
    return;
  }

  if (stderr) {
    logger.error(stderr.toString());
    callback?.(stderr);
    return;
  }

  logger.info(stdout.toString());
  callback?.(stdout);
};
