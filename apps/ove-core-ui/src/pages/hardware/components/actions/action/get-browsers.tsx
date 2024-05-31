import React from "react";
import { Window } from "react-bootstrap-icons";
import { useStore } from "../../../../../store";
import type { ActionProps } from "../../../types";

import styles from "../actions.module.scss";

const GetBrowsers = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "browser",
    deviceId,
    tag,
    pending: false
  })} title="window status - all" className={styles["get-browsers"]}>
    <div id={styles["container"]}>
      <Window id={styles["back"]} />
      <Window id={styles["middle"]} />
      <Window id={styles["front"]} />
    </div>
  </button>;
};

export default GetBrowsers;
