import React from "react";
import Info from "./action/info";
import Status from "./action/status";
import Start from "./action/start";
import Shutdown from "./action/shutdown";
import Reboot from "./action/reboot";
import Execute from "./action/execute";
import Screenshot from "./action/screenshot";
import Input from "./action/input";
import GetBrowser from "./action/get-browser";
import GetBrowsers from "./action/get-browsers";
import OpenBrowser from "./action/open-browser";
import CloseBrowser from "./action/close-browser";
import CloseBrowsers from "./action/close-browsers";
import Volume from "./action/volume";
import Mute from "./action/mute";
import Unmute from "./action/unmute";
import MuteAudio from "./action/mute-audio";
import UnmuteAudio from "./action/unmute-audio";
import MuteVideo from "./action/mute-video";
import UnmuteVideo from "./action/unmute-video";

import styles from "./actions.module.scss";

const MultiActions = ({ bridgeId }: { bridgeId: string }) =>
  <div className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <Status bridgeId={bridgeId} deviceId={null} />
      <Info bridgeId={bridgeId} deviceId={null} />
    </div>
    <div className={styles.container}>
      <Start bridgeId={bridgeId} deviceId={null} />
      <Shutdown bridgeId={bridgeId} deviceId={null} />
      <Reboot bridgeId={bridgeId} deviceId={null} />
    </div>
    <div className={styles.container}>
      <Execute bridgeId={bridgeId} deviceId={null} />
      <Screenshot bridgeId={bridgeId} deviceId={null} />
      <Input bridgeId={bridgeId} deviceId={null} />
    </div>
    <div className={styles.container}>
      <GetBrowser bridgeId={bridgeId} deviceId={null} />
      <GetBrowsers bridgeId={bridgeId} deviceId={null} />
      <OpenBrowser bridgeId={bridgeId} deviceId={null} />
      <CloseBrowser bridgeId={bridgeId} deviceId={null} />
      <CloseBrowsers bridgeId={bridgeId} deviceId={null} />
    </div>
    <div id={styles["volume"]} className={styles.container}>
      <Volume bridgeId={bridgeId} deviceId={null} />
      <Mute bridgeId={bridgeId} deviceId={null} />
      <Unmute bridgeId={bridgeId} deviceId={null} />
      <MuteAudio bridgeId={bridgeId} deviceId={null} />
      <UnmuteAudio bridgeId={bridgeId} deviceId={null} />
      <MuteVideo bridgeId={bridgeId} deviceId={null} />
      <UnmuteVideo bridgeId={bridgeId} deviceId={null} />
    </div>
  </div>;

export default MultiActions;
