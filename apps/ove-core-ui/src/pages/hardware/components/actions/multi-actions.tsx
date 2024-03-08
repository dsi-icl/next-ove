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
import { type FilterType } from "../../types";
import UnmuteVideo from "./action/unmute-video";

import styles from "./actions.module.scss";

const MultiActions = ({ bridgeId, type, value }: {
  bridgeId: string,
  value: string | null
  type: FilterType
}) => {
  const tag = type === "tags" ? (value ?? undefined) : undefined;
  const deviceId = type === "id" ? value : null;
  return <div className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <Status bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <Info bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
    </div>
    <div className={styles.container}>
      <Start bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <Shutdown bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <Reboot bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
    </div>
    <div className={styles.container}>
      <Execute bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <Screenshot bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <Input bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
    </div>
    <div className={styles.container}>
      <GetBrowser bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <GetBrowsers bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <OpenBrowser bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <CloseBrowser bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <CloseBrowsers bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
    </div>
    <div id={styles["volume"]} className={styles.container}>
      <Volume bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <Mute bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <Unmute bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <MuteAudio bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <UnmuteAudio bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <MuteVideo bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <UnmuteVideo bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
    </div>
  </div>;
};

export default MultiActions;
