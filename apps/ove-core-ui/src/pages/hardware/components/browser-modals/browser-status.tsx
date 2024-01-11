import React from "react";
import { assert } from "@ove/ove-utils";
import { useStore } from "../../../../store";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./browsers.module.scss";

const BrowserStatus = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const browsers = useStore(state => state.hardwareConfig.browsers);
  const paginationIdx = useStore(state => state.hardwareConfig.paginationIdx);

  if (browsers === null || browserId === null) return <div></div>;

  const getMaxLen = (browsers_: typeof browsers) =>
    Array.isArray(browsers_) ? browsers_.length : null;
  const deviceId = Array.isArray(browsers) ?
    browsers[paginationIdx].deviceId :
    assert(deviceAction.deviceId);

  return <PaginatedDialog data={browsers} maxLen={getMaxLen(browsers)}>
    <div className={styles.status}>
      <h4>Browsers - {deviceId}</h4>
      <table>
        <thead>
          <tr>
            <th>Browser ID</th>
            <th>Display ID</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {Array.from((Array.isArray(browsers) ?
            browsers[paginationIdx].response : browsers)
            .entries()).map(([k, v]) =>
            <tr key={k}>
              <td>{k}</td>
              <td>{v.displayId}</td>
              <td>{v.url}</td>
            </tr>)}
        </tbody>
      </table>
    </div>
  </PaginatedDialog>;
};

export default BrowserStatus;
