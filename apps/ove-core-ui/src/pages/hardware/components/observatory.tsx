import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import { useEffect, useState } from "react";
import { type ServiceType } from "@ove/ove-types";

import {
  Projector,
  HddNetwork,
  Display
} from "react-bootstrap-icons";
import Info from "./info";
import { Dialog, Snackbar, useDialog, useSnackbar } from "@ove/ui-components";
import Console from "./console";
import { useClient, useHardware } from "../hooks/hooks";
import Actions from "./actions";

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

export type DeviceInfo = {
  deviceId: string
  data: object
}

const getProtocolIcon = (protocol: ServiceType) => {
  switch (protocol) {
    case "node":
      return <HddNetwork style={{ margin: "0.6rem 0" }} />;
    case "mdc":
      return <Display style={{ margin: "0.6rem 0" }} />;
    case "pjlink":
      return <Projector style={{ margin: "0.6rem 0" }} />;
  }
};

const Observatory = ({ name, isOnline, style }: ObservatoryProps) => {
  const client = useClient();
  const { ref: consoleDialog, closeDialog: closeConsole, openDialog: openConsole } = useDialog();
  const { ref: infoDialog, closeDialog: closeInfo, openDialog: openInfo } = useDialog();
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const { hardware, updateHardware } = useHardware(client, isOnline, name);
  const { notification, show: showNotification, isVisible } = useSnackbar();

  useEffect(() => {
    openInfo();
  }, [info]);

  return <section style={{ ...style, marginLeft: "2rem", marginRight: "2rem" }}>
    <h2
      style={{ fontWeight: "700" }}>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {isOnline ? <>
      {info ? <Dialog ref={infoDialog} closeDialog={closeInfo}
                      title={"Device Information"}>
        <Info info={info} close={() => {
          closeInfo();
          setInfo(null);
        }} />
      </Dialog> : null}
      <Dialog ref={consoleDialog} closeDialog={closeConsole} title={"Console"}>
        <Console close={closeConsole} />
      </Dialog>
      <DataGrid className="rdg-light" columns={columns}
                rows={hardware.map(({ device, status }) => ({
                  protocol: getProtocolIcon(device.type),
                  id: device.id,
                  hostname: device.ip,
                  mac: device.mac,
                  tags: device.tags,
                  status: status,
                  actions: <Actions client={client} openConsole={openConsole}
                                    showNotification={showNotification}
                                    name={name} updateHardware={updateHardware}
                                    device={device}
                                    setInfo={info => setInfo(info as DeviceInfo)} />
                }))} />
      <Snackbar text={notification ?? ""} show={isVisible} />
    </> : null}
  </section>;
};

export default Observatory;