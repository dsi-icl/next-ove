import { FormEvent, forwardRef, useState } from "react";
import { Mode } from "../../utils";
import { Device, NativeEvent, ServiceType } from "@ove/ove-types";

import styles from "./edit-device.module.scss";
import { assert } from "@ove/ove-utils";

type EditDeviceProps = {
  setMode: (mode: Mode) => void
  device: Device | null
}

const EditDevice = forwardRef<HTMLDialogElement, EditDeviceProps>(({
  device,
  setMode
}, ref) => {
  const [type, setType] = useState<ServiceType>(device?.type ?? "node");
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = device?.id ?? (formData.get("device-id") ?? "").toString();

    if (id === "" || id.length < 1) return false;
    if ((e.nativeEvent as unknown as NativeEvent).submitter.name === "delete") {
      window.electron.deleteDevice(assert(device).id)
        .catch(console.error).then(() => setMode("overview"));
      return;
    }
    let auth = null;

    if (type === "node") {
      auth = false;
    } else {
      const username = (formData.get("device-auth-username") ?? "").toString();
      const password = (formData.get("device-auth-password") ?? "").toString();

      if (username !== "" || password !== "") {
        auth = { username, password };
      }
    }

    const updatedDevice: Device = {
      id,
      description: (formData.get("device-description") ?? "").toString(),
      type: (formData.get("device-type") ?? "").toString() as ServiceType,
      protocol: (formData.get("device-protocol") ?? "").toString(),
      ip: (formData.get("device-ip") ?? "").toString(),
      port: parseInt((formData.get("device-port") ?? 3333).toString()),
      mac: (formData.get("device-mac") ?? "").toString(),
      tags: [],
      auth
    };
    if (JSON.stringify(updatedDevice) === JSON.stringify(device)) {
      setMode("overview");
    } else {
      window.electron.saveDevice(updatedDevice)
        .catch(console.error)
        .then(() => setMode("overview"));
    }
  };

  return <dialog
    ref={ref} className={styles.dialog}
    onClick={() => setMode("overview")}>
    <div className={styles.hidden} onClick={e => e.stopPropagation()}>
      <h2>{device === null ? "Register Device" : "Edit Device"}</h2>
      <form method="post" onSubmit={handleSubmit} className={styles.form}>
        {device === null ? <>
          <label htmlFor="device-id">ID</label>
          <input id="device-id" type="text" name="device-id" />
        </> : null}
        <label htmlFor="device-description">Description</label>
        <input
          id="device-description" type="text" name="device-description"
          defaultValue={device?.description} />
        <label htmlFor="device-type">Protocol</label>
        <select
          id="device-type" name="device-type"
          defaultValue={type}
          onChange={e =>
            setType(e.currentTarget.value as ServiceType)}>
          <option value="node">Node</option>
          <option value="pjlink">Protocol</option>
          <option value="mdc">Screen</option>
        </select>
        <label htmlFor="device-protocol">Protocol</label>
        <input
          id="device-protocol" type="text" name="device-protocol"
          defaultValue={device?.protocol} />
        <label htmlFor="device-ip">IP</label>
        <input
          id="device-ip" type="text" name="device-ip"
          defaultValue={device?.ip} />
        <label htmlFor="device-port">Port</label>
        <input
          id="device-port" type="number" name="device-port"
          defaultValue={device?.port} />
        <label htmlFor="device-mac">MAC Address</label>
        <input
          id="device-mac" type="text" name="device-mac"
          defaultValue={device?.mac} />
        {type !== "node" ? <>
          <h4>Authentication</h4>
          <label htmlFor="device-auth-username">Username</label>
          <input
            id="device-auth-username" type="text"
            name="device-auth-username" />
          <label htmlFor="device-auth-password">Password</label>
          <input
            id="device-auth-password" type="password"
            name="device-auth-password" />
        </> : null}
        <div className={styles["action-container"]}>
          <button
            type="submit" name="save"
            value="save">{device === null ? "Save" : "Update"}</button>
          {device !== null ? <button
            type="submit" name="delete" value="delete"
            id={styles["delete"]}>Delete</button> : null}
        </div>
      </form>
    </div>
  </dialog>;
});

export default EditDevice;
