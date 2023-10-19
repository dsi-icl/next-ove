import { assert } from "@ove/ove-utils";
import { useStore } from "../../../../store";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./screenshot.module.scss";

const ScreenshotDisplay = () => {
  const paginationIdx = useStore(state => state.hardwareConfig.paginationIdx);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const curScreenshots = useStore(state => state.hardwareConfig.screenshots);
  const screenshotConfig = useStore(state => state.hardwareConfig.screenshotConfig);

  let deviceId: string | null = null;
  let screenshots: string[] | null = null;
  let state: "no_data" | "multi" | "single" = "no_data";

  if (curScreenshots !== null && curScreenshots.length > 0) {
    if (typeof curScreenshots[0] === "string") {
      screenshots = curScreenshots as string[];
      deviceId = assert(deviceAction.deviceId);
      state = "single";
    } else {
      const entry = assert((curScreenshots as {
        deviceId: string,
        response: string[]
      }[])[paginationIdx]);
      screenshots = entry.response;
      deviceId = entry.deviceId;
      state = "multi";
    }
  }

  return state !== "no_data" ? <PaginatedDialog data={screenshots}
                                                maxLen={state === "single" ? null : assert(screenshots).length}>
    <div className={styles.display}>
      <h4>Info - {deviceId}</h4>
      <ul>
        {assert(screenshots).map((screenshot, i) => <li
          key={screenshot}>{screenshotConfig?.method === "response" ? <img
          src={screenshot} alt={`Screenshot - ${i}`} /> : screenshot}</li>)}
      </ul>
    </div>
  </PaginatedDialog> : null;
};

export default ScreenshotDisplay;
