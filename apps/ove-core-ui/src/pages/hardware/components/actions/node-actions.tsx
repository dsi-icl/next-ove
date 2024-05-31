import React from "react";
import Info from "./action/info";
import Start from "./action/start";
import Reboot from "./action/reboot";
import Status from "./action/status";
import Execute from "./action/execute";
import Shutdown from "./action/shutdown";
import Screenshot from "./action/screenshot";
import GetBrowsers from "./action/get-browsers";
import OpenBrowsers from "./action/open-browsers";
import CloseBrowsers from "./action/close-browsers";
import type { ActionController } from "../../types";

import styles from "./actions.module.scss";

const NodeActions = ({ device, bridgeId }: ActionController) => <div
  className={styles.actions}>
  <div id={styles["info"]} className={styles.container}>
    <Status bridgeId={bridgeId} deviceId={device.id} />
    <Info bridgeId={bridgeId} deviceId={device.id} />
  </div>
  <div className={styles.container}>
    <Start bridgeId={bridgeId} deviceId={device.id} />
    <Shutdown bridgeId={bridgeId} deviceId={device.id} />
    <Reboot bridgeId={bridgeId} deviceId={device.id} />
  </div>
  <div className={styles.container}>
    <Execute bridgeId={bridgeId} deviceId={device.id} />
    <Screenshot bridgeId={bridgeId} deviceId={device.id} />
  </div>
  <div id={styles["windows"]} className={styles.container}>
    <GetBrowsers bridgeId={bridgeId} deviceId={device.id} />
    <OpenBrowsers bridgeId={bridgeId} deviceId={device.id} />
    <CloseBrowsers bridgeId={bridgeId} deviceId={device.id} />
  </div>
</div>;

export default NodeActions;
