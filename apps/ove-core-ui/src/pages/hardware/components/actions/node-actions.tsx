import React from "react";
import Status from "./action/status";
import Info from "./action/info";
import Start from "./action/start";
import Shutdown from "./action/shutdown";
import Reboot from "./action/reboot";
import Execute from "./action/execute";
import Screenshot from "./action/screenshot";
import GetBrowser from "./action/get-browser";
import GetBrowsers from "./action/get-browsers";
import OpenBrowser from "./action/open-browser";
import CloseBrowser from "./action/close-browser";
import CloseBrowsers from "./action/close-browsers";
import { type ActionController } from "../../types";

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
    <GetBrowser bridgeId={bridgeId} deviceId={device.id} />
    <GetBrowsers bridgeId={bridgeId} deviceId={device.id} />
    <OpenBrowser bridgeId={bridgeId} deviceId={device.id} />
    <CloseBrowser bridgeId={bridgeId} deviceId={device.id} />
    <CloseBrowsers bridgeId={bridgeId} deviceId={device.id} />
  </div>
</div>;

export default NodeActions;
