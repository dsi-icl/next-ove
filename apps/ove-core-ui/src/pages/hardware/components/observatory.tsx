import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import { useEffect, useState } from "react";
import { type ServiceType } from "@ove/ove-types";

import {
  Projector,
  HddNetwork,
  Display,
  CameraVideo,
  Calendar
} from "react-bootstrap-icons";
import Info from "./info";
import { Dialog, Snackbar, useDialog, useSnackbar } from "@ove/ui-components";
import Console from "./console";
import Actions from "./actions";
import { useHardware } from "../hooks/hooks";
import { assert } from "@ove/ove-utils";

import styles from "./observatory.module.scss";
import LiveView from "./live-view/live-view";

export type ObservatoryProps = {
  name: string
  isOnline: boolean
  style: object
}

const columns = [
  { key: "protocol", name: "Protocol" },
  { key: "id", name: "ID" },
  { key: "hostname", name: "Hostname" },
  { key: "mac", name: "MAC" },
  { key: "tags", name: "Tags" },
  { key: "status", name: "Status" },
  { key: "actions", name: "Actions" }
];

const ProtocolIcon = ({ protocol }: { protocol: ServiceType }) => {
  switch (protocol) {
    case "node":
      return <HddNetwork className={styles["protocol-icon"]} />;
    case "mdc":
      return <Display className={styles["protocol-icon"]} />;
    case "pjlink":
      return <Projector className={styles["protocol-icon"]} />;
  }
};

const Observatory = ({ name, isOnline, style }: ObservatoryProps) => {
  const {
    ref: consoleDialog,
    closeDialog: closeConsole,
    openDialog: openConsole
  } = useDialog();
  const {
    ref: infoDialog,
    closeDialog: closeInfo,
    openDialog: openInfo
  } = useDialog();
  const {
    ref: videoDialog,
    closeDialog: closeVideoDialog,
    openDialog: openVideoDialog,
    isOpen: videoDialogIsOpen
  } = useDialog();
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null);
  const { hardware, updateHardware } = useHardware(isOnline, name);
  const { notification, show: showNotification, isVisible } = useSnackbar();

  useEffect(() => {
    if (deviceInfo === null) {
      closeInfo();
    } else {
      openInfo();
    }
  }, [deviceInfo]);

  return <section className={styles.observatory} style={style}>
    <div className={styles.header}>
      <h2>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
      {isOnline ? <div className={styles.actions}>
        <button className={styles.icon} onClick={openVideoDialog}><CameraVideo /></button>
        <button className={styles.icon}><Calendar /></button>
      </div> : null}
    </div>
    {isOnline ? <>
      <Dialog ref={infoDialog} closeDialog={closeInfo}
              title={"Device Information"}>
        {deviceInfo !== null ? <Info
          device={assert(hardware.find(({ device: { id } }) => id === deviceInfo)).device}
          bridgeId={name} close={() => {
          setDeviceInfo(null);
        }} /> : null}
      </Dialog>
      <Dialog ref={consoleDialog} closeDialog={closeConsole} title={"Console"}>
        <Console close={closeConsole} />
      </Dialog>
      <Dialog closeDialog={closeVideoDialog} title="Video Monitoring" ref={videoDialog} style={{width: "90vw", maxHeight: "unset", height: "90vh"}}>
        <LiveView bridgeId={name} isOpen={videoDialogIsOpen} />
      </Dialog>
      <DataGrid className="rdg-light" columns={columns}
                rows={hardware.map(({ device, status }) => ({
                  protocol: <ProtocolIcon protocol={device.type} />,
                  id: device.id,
                  hostname: device.ip,
                  mac: device.mac,
                  tags: device.tags,
                  status: status,
                  actions: <Actions openConsole={openConsole}
                                    showNotification={showNotification}
                                    name={name} updateHardware={updateHardware}
                                    device={device}
                                    selectInfo={() => setDeviceInfo(device.id)} />
                }))} />
      <Snackbar text={notification ?? ""} show={isVisible} />
    </> : null}
  </section>;
};

export default Observatory;