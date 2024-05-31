import React from "react";
import Info from "./action/info";
import Mute from "./action/mute";
import Input from "./action/input";
import Start from "./action/start";
import Reboot from "./action/reboot";
import Status from "./action/status";
import Unmute from "./action/unmute";
import Volume from "./action/volume";
import Execute from "./action/execute";
import Shutdown from "./action/shutdown";
import MuteAudio from "./action/mute-audio";
import MuteVideo from "./action/mute-video";
import Screenshot from "./action/screenshot";
import type { FilterType } from "../../types";
import GetBrowsers from "./action/get-browsers";
import UnmuteAudio from "./action/unmute-audio";
import UnmuteVideo from "./action/unmute-video";
import OpenBrowsers from "./action/open-browsers";
import CloseBrowsers from "./action/close-browsers";

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
      <GetBrowsers bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
      <OpenBrowsers bridgeId={bridgeId} deviceId={deviceId} tag={tag} />
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
