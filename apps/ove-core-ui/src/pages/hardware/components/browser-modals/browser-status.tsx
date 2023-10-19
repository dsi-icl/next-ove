import { assert } from "@ove/ove-utils";
import { useStore } from "../../../../store";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./browsers.module.scss";

const BrowserStatus = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const browserStatus = useStore(state => state.hardwareConfig.browserStatus);
  const paginationIdx = useStore(state => state.hardwareConfig.paginationIdx);

  if (browserStatus === null || browserId === null) return <div></div>;

  const getMaxLen = (browserStatus_: typeof browserStatus) => {
    switch (browserStatus_) {
      case "off":
      case null:
      case "running":
        return null;
      default:
        return browserStatus_.length;
    }
  };

  return <PaginatedDialog data={browserStatus}
                          maxLen={getMaxLen(browserStatus)}>
    <div className={styles.status}>
      <h4>Browser Status - {typeof browserStatus === "string" ? assert(deviceAction.deviceId) : browserStatus[paginationIdx].deviceId}</h4>
      <table>
        <thead>
        <tr>
          <th>Browser ID</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{browserId}</td>
          <td>{typeof browserStatus === "string" ? browserStatus : browserStatus[paginationIdx].response}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </PaginatedDialog>;
};

export default BrowserStatus;
