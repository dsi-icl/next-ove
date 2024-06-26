import React from "react";
import Info from "./action/info";
import Mute from "./action/mute";
import Start from "./action/start";
import Reboot from "./action/reboot";
import Status from "./action/status";
import Unmute from "./action/unmute";
import Volume from "./action/volume";
import Shutdown from "./action/shutdown";
import MuteAudio from "./action/mute-audio";
import MuteVideo from "./action/mute-video";
import UnmuteAudio from "./action/unmute-audio";
import UnmuteVideo from "./action/unmute-video";
import type { ActionController } from "../../types";

import styles from "./actions.module.scss";

const ProjectorActions = ({ device, bridgeId }: ActionController) =>
  <div className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <Status bridgeId={bridgeId} deviceId={device.id} />
      <Info bridgeId={bridgeId} deviceId={device.id} />
    </div>
    <div id={styles["power"]} className={styles.container}>
      <Start bridgeId={bridgeId} deviceId={device.id} />
      <Shutdown bridgeId={bridgeId} deviceId={device.id} />
      <Reboot bridgeId={bridgeId} deviceId={device.id} />
    </div>
    <div id={styles["volume"]} className={styles.container}>
      <Volume bridgeId={bridgeId} deviceId={device.id} />
      <Mute bridgeId={bridgeId} deviceId={device.id} />
      <Unmute bridgeId={bridgeId} deviceId={device.id} />
      <MuteAudio bridgeId={bridgeId} deviceId={device.id} />
      <UnmuteAudio bridgeId={bridgeId} deviceId={device.id} />
      <MuteVideo bridgeId={bridgeId} deviceId={device.id} />
      <UnmuteVideo bridgeId={bridgeId} deviceId={device.id} />
    </div>
  </div>;

export default ProjectorActions;
