import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import React, { useMemo, useState } from "react";
import { api } from "../../../../utils/api";
import { useStore } from "../../../../store";
import type { DeviceAction } from "../../types";
import { skipMulti, skipSingle } from "../../utils";
import { type Browser, isError } from "@ove/ove-types";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./browsers.module.scss";

type SingleBrowserResponse = Record<string, Browser>
type MultiBrowserResponse = {
  response: Record<string, Browser>,
  deviceId: string
}[]

const useBrowser = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined,
  action: DeviceAction
) => {
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const getBrowsers = api.hardware.getBrowsers.useQuery({ bridgeId, deviceId: deviceId ?? "" }, {
    enabled: browserId === null && !skipSingle("browser", bridgeId, action)
  });
  const getBrowsersAll = api.hardware.getBrowsersAll.useQuery({ bridgeId, tag }, {
    enabled: browserId === null && !skipMulti("browser", bridgeId, action),
  });
  const browsers: SingleBrowserResponse | MultiBrowserResponse = useMemo(() => {
    if (browserId === null && !skipSingle("browser", bridgeId, action)) {
      switch (getBrowsers.status) {
        case "success": {
          if (isError(getBrowsers.data.response)) {
            toast.error("Unable to get browsers");
            return {};
          }

          return getBrowsers.data.response;
        }
        case "error":
          toast.error("Unable to get browsers");
          return {};
        default:
          return {};
      }
    } else {
      switch (getBrowsersAll.status) {
        case "success": {
          if (isError(getBrowsersAll.data.response)) {
            toast.error("Unable to get browsers");
            return [];
          }
          return getBrowsersAll.data.response.filter(({ response }) => {
            if (isError(response)) {
              toast.error(`Failed to get browsers on ${deviceId}`);
              return false;
            }
            return true;
          }) as MultiBrowserResponse;
        }
        case "error":
          toast.error("Unable to get browsers");
          return [];
        default:
          return [];
      }
    }
  }, [getBrowsersAll.status, getBrowsersAll.data?.response, deviceId, browserId, bridgeId, action, getBrowsers.status, getBrowsers.data?.response]);
  return browsers;
};

const BrowserStatus = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const [idx, setIdx] = useState(0);
  const browsers = useBrowser(
    assert(deviceAction.bridgeId),
    deviceAction.deviceId,
    deviceAction.tag,
    deviceAction
  );

  const getMaxLen = (browsers_: typeof browsers) => {
    if (Array.isArray(browsers_)) return browsers_.length;
    if (browsers_ === null) return 0;
    return Object.keys(browsers_).length;
  };
  const deviceId = Array.isArray(browsers) ?
    browsers[idx].deviceId :
    assert(deviceAction.deviceId);

  return <PaginatedDialog idx={idx} setIdx={setIdx}
                          maxLen={getMaxLen(browsers)}>
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
          {Object.entries((Array.isArray(browsers) ?
            browsers[idx].response : browsers)
          ).map(([k, v]) =>
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
