import { useCallback, useEffect, useRef, useState } from "react";
import { Device, ServiceType } from "@ove/ove-types";
import {
  Display,
  HddNetwork,
  PlusCircleFill,
  Projector
} from "react-bootstrap-icons";
import EditDevice from "../edit-device/edit-device";
import Auth from "../auth/auth";
import { Mode } from "../../utils";

import styles from "./devices.module.scss";
import { assert } from "@ove/ove-utils";

type DeviceCardProps = {
  device: Device
  setMode: (mode: Mode) => void
}

const DeviceCard = ({ device, setMode }: DeviceCardProps) => {
  const getProtocolIcon = (protocol: ServiceType) => {
    switch (protocol) {
      case "node":
        return <HddNetwork className={styles["device-icon"]} />;
      case "mdc":
        return <Display className={styles["device-icon"]} />;
      case "pjlink":
        return <Projector className={styles["device-icon"]} />;
    }
  };
  const needsAuth = device.auth === false;
  return <article className={styles["device-card"]} key={device.id}>
    {getProtocolIcon(device.type)}
    <h4>{device.id}</h4>
    <div className={styles["action-container"]}>
      <button
        onClick={e => {
          e.preventDefault();
          setMode("edit");
        }}>Edit
      </button>
      {needsAuth ? <button onClick={e => {
        e.preventDefault();
        setMode("auth");
      }} id={styles["authorise"]}>Authorise</button> : null}
    </div>
  </article>;
};

const Devices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [mode, setMode] = useState<Mode>("overview");
  const editRef = useRef<HTMLDialogElement | null>(null);
  const authRef = useRef<HTMLDialogElement | null>(null);
  const [id, setId] = useState<string | null>(null);

  const close = useCallback(() => setMode("overview"), []);

  useEffect(() => {
    window.electron.getDevices().then(devices => setDevices(devices));
    switch (mode) {
      case "overview":
        editRef.current?.close();
        authRef.current?.close();
        editRef.current?.removeEventListener?.("close", close);
        authRef.current?.removeEventListener?.("close", close);
        setId(null);
        break;
      case "edit":
        editRef.current?.showModal();
        editRef.current?.addEventListener?.("close", close);
        authRef.current?.close();
        authRef.current?.removeEventListener?.("close", close);
        break;
      case "auth":
        editRef.current?.close();
        editRef.current?.removeEventListener?.("close", close);
        authRef.current?.showModal();
        authRef.current?.addEventListener?.("close", close);
        break;
    }
  }, [mode, close]);

  return <section className={styles.body}>
    <div className={styles.main}>
      <h1 className={styles.header}>Devices</h1>
      {mode === "edit" ?
        <EditDevice
          ref={editRef}
          setMode={mode => setMode(mode)}
          device={id === null ? null : (devices.find(({ id: deviceId }) =>
            deviceId === id) ?? null)} /> : null}
      {mode === "auth" ? <Auth
        ref={authRef}
        device={assert(devices.find(({ id: deviceId }) =>
          deviceId === id))}
        setMode={mode => setMode(mode)} /> : null}
      <div className={styles["devices-container"]}>
        {devices.map(device => <DeviceCard
          key={device.id} device={device}
          setMode={mode => {
            setId(device.id);
            setMode(mode);
          }} />)}
      </div>
    </div>
    <button className={styles.fab} onClick={e => {
      e.preventDefault();
      setMode("edit");
    }}><PlusCircleFill color="#002147" /></button>
  </section>;
};

export default Devices;
