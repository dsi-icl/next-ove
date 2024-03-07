import React, { useState } from "react";
import { assert } from "@ove/ove-utils";
import { useStore } from "../../../../store";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./browsers.module.scss";
import { trpc } from "../../../../utils/api";
import { type Browser, isError } from "@ove/ove-types";
import { toast } from "sonner";
import { skipMulti, skipSingle } from "../../utils";
import { DeviceAction } from "../../types";

const useBrowser = (
  bridgeId: string,
  deviceId: string | null,
  action: DeviceAction,
  setBrowsers: (browsers: Map<number, Browser> | {
    response: Map<number, Browser>,
    deviceId: string
  }[]) => void
) => {
  const browserId = useStore(state => state.hardwareConfig.browserId);
  trpc.hardware.getBrowser.useQuery({
    bridgeId,
    deviceId: deviceId ?? "",
    browserId: browserId ?? -1
  }, {
    enabled: browserId !== null && !skipSingle("browser", bridgeId, action),
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error(`Unable to get browser 
        ${browserId ?? -1} on ${deviceId ?? ""}`);
        return;
      }

      setBrowsers(new Map([[assert(browserId), response]]));
    },
    onError: () =>
      toast.error(`Unable to get browser 
      ${browserId ?? -1} on ${deviceId ?? ""}`)
  });
  trpc.hardware.getBrowserAll.useQuery({
    bridgeId,
    browserId: browserId ?? -1
  }, {
    enabled: browserId !== null && !skipMulti("browser", bridgeId, action),
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to get browsers");
        return;
      }

      response.filter(({ response }) =>
        "oveError" in response).forEach(({ deviceId }) =>
        toast.error(`Failed to get browser on ${deviceId}`));
      setBrowsers(response
        .filter(({ response }) => !("oveError" in response)).map(({
          deviceId,
          response
        }) => ({
          deviceId,
          response: new Map([[assert(browserId), response as Browser]])
        })));
    },
    onError: () => toast.error("Unable to get browsers")
  });
  trpc.hardware.getBrowsers.useQuery({ bridgeId, deviceId: deviceId ?? "" }, {
    enabled: browserId === null && !skipSingle("browser", bridgeId, action),
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to get browsers");
        return;
      }

      setBrowsers(response as Map<number, Browser>);
    },
    onError: () => toast.error("Unable to get browsers")
  });
  trpc.hardware.getBrowsersAll.useQuery({ bridgeId }, {
    enabled: browserId === null && !skipMulti("browser", bridgeId, action),
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to get browsers");
        return;
      }

      response.filter(({ response }) =>
        "oveError" in response).forEach(({ deviceId }) =>
        toast.error(`Failed to get browsers on ${deviceId}`));
      setBrowsers(response
        .filter(({ response }) => !("oveError" in response)) as {
        deviceId: string,
        response: Map<number, Browser>
      }[]);
    },
    onError: () => toast.error("Unable to get browsers")
  });
};

const BrowserStatus = () => {
  const [browsers, setBrowsers] = useState<Map<number, Browser> | {
    response: Map<number, Browser>,
    deviceId: string
  }[] | null>(null);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const [idx, setIdx] = useState(0);
  useBrowser(
    assert(deviceAction.bridgeId),
    deviceAction.deviceId,
    deviceAction,
    setBrowsers
  );

  if (browsers === null || browserId === null) return <div></div>;

  const getMaxLen = (browsers_: typeof browsers) =>
    Array.isArray(browsers_) ? browsers_.length : 0;
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
          {Array.from((Array.isArray(browsers) ?
            browsers[idx].response : browsers)
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
