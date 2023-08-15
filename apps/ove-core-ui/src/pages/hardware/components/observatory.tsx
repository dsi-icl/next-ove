import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import { useEffect, useRef, useState } from "react";
import { Device, is, OVEExceptionSchema, ServiceType } from "@ove/ove-types";
import { createClient } from "../../../utils";

import {
  Projector,
  HddNetwork,
  Display,
  ArrowRepeat,
  InfoCircle,
  PlayCircle,
  StopCircle,
  FileEarmarkCode,
  GpuCard
} from "react-bootstrap-icons";
import InfoDialog from "./info-dialog";
import ConsoleDialog from "./console-dialog";
import { Snackbar } from "@ove/ui-components";

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

type HardwareInfo = {
  device: Device
  status: boolean | null
}

type DeviceInfo = {
  deviceId: string
  data: object
}

export default ({ name, isOnline, style }: ObservatoryProps) => {
  const [hardware, setHardware] = useState<HardwareInfo[]>([]);
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const dialog = useRef<HTMLDialogElement | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const consoleDialog = useRef<HTMLDialogElement | null>(null);
  const [openConsole, setOpenConsole] = useState<boolean>(false);
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

  useEffect(() => {
    if (!isOnline) return;
    createClient().bridge.getDevices.query({ bridgeId: name }).then(result => {
      if (!result || is(OVEExceptionSchema, result.response)) {
        return;
      }
      setHardware(result.response.map(device => ({
        device,
        status: null,
        info: null
      })));
    }).catch(console.error);
  }, []);

  const updateStatus = async (deviceId: string) => {
    const status = (await createClient().hardware.getStatus.query({
      bridgeId: name,
      deviceId
    }))["response"] ? "running" : "off";
    setHardware(cur => {
      const idx = cur.findIndex(({ device: { id } }) => id === deviceId);
      const copy = JSON.parse(JSON.stringify(cur));
      copy[idx] = { ...copy[idx], status };
      return copy;
    });
  };

  useEffect(() => {
    if (info === null) {
      dialog.current?.close();
    } else {
      dialog.current?.showModal();
    }
  }, [info]);

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification(null);
    }, 1_500);
  };

  const flatten = (obj: object): object => {
    return (Object.keys(obj) as Array<keyof typeof obj>).reduce((acc, k) => {
      if (typeof obj[k] === "object") {
        return {
          ...acc,
          ...flatten(obj[k])
        };
      } else {
        acc[k] = obj[k];
        return acc;
      }
    }, {});
  };

  const updateInfo = async (deviceId: string) => {
    const i = (await createClient().hardware.getInfo.query({
      bridgeId: name,
      deviceId
    }))["response"];
    // @ts-ignore
    delete i["type"];
    // @ts-ignore
    setInfo({ deviceId, data: flatten(i) });
  };

  const startDevice = async (deviceId: string) => {
    await createClient().hardware.start.mutate({
      bridgeId: name,
      deviceId
    });
    showNotification(`Started ${deviceId}`);
  };

  const stopDevice = async (deviceId: string) => {
    await createClient().hardware.shutdown.mutate({
      bridgeId: name,
      deviceId
    });
    showNotification(`Stopped ${deviceId}`);
  };

  const openTerminal = async (deviceId: string) => {
    setOpenConsole(true);
  };

  useEffect(() => {
    if (!openConsole) return;
    consoleDialog.current?.showModal();
  }, [openConsole]);

  const closeTerminal = () => {
    consoleDialog.current?.close();
    setOpenConsole(false);
  };

  return <section style={{ ...style, marginLeft: "2rem", marginRight: "2rem" }}>
    <h2
      style={{ fontWeight: "700" }}>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {info === null ? null : <InfoDialog ref={dialog} info={info} setInfo={setInfo} />}
    {openConsole ? <ConsoleDialog ref={consoleDialog} close={closeTerminal} /> : null}
    {!isOnline ? null :
      <DataGrid className="rdg-light" columns={columns}
                rows={hardware.map(({ device, status }) => ({
                  protocol: getProtocolIcon(device.type),
                  id: device.id,
                  hostname: device.ip,
                  mac: device.mac,
                  tags: device.tags,
                  status: status,
                  actions: <div
                    style={{ display: "flex", justifyContent: "space-around" }}>
                    <button style={{ margin: "0.6rem 0" }}
                            onClick={() => {
                              updateStatus(device.id).catch(console.error);
                            }} title="status">
                      <ArrowRepeat /></button>
                    <button style={{ margin: "0.6rem 0" }} onClick={() => {
                      updateInfo(device.id).catch(console.error);
                    }} title="info">
                      <InfoCircle /></button>
                    <button style={{ margin: "0.6rem 0" }} onClick={() => {
                      startDevice(device.id).catch(console.error);
                    }} title="start">
                      <PlayCircle /></button>
                    <button style={{ margin: "0.6rem 0" }} onClick={() => {
                      stopDevice(device.id).catch(console.error);
                    }} title="stop">
                      <StopCircle /></button>
                    <button style={{ margin: "0.6rem 0" }} onClick={() => {
                      openTerminal(device.id).catch(console.error);
                    }} title="execute">
                      <FileEarmarkCode /></button>
                    <button style={{ margin: "0.6rem 0" }} title="display">
                      <GpuCard /></button>
                  </div>
                }))} />}
    {notification !== null ? <Snackbar text={notification} /> : null}
  </section>;
}