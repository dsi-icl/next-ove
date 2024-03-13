import React, {
  type BaseSyntheticEvent,
  forwardRef,
  useCallback,
  useState
} from "react";
import { type Mode } from "../../utils";
import {
  type Device,
  type NativeEvent,
  type ServiceType
} from "@ove/ove-types";
import { assert } from "@ove/ove-utils";
import { useForm } from "react-hook-form";
// TODO: investigate circular dependency
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Dialog } from "@ove/ui-components";

import styles from "./edit-device.module.scss";

type EditDeviceProps = {
  setMode: (mode: Mode) => void;
  device: Device | null;
};

type Form = {
  id?: string;
  authPassword?: string;
  description: string;
  type: ServiceType;
  protocol: string;
  ip: string;
  port: string;
  mac: string;
};

const saveDevice_ = (
  device: Device | null,
  setMode: (mode: Mode) => void,
  type: ServiceType,
  data: Form,
  e: BaseSyntheticEvent<object> | undefined
) => {
  const id = device?.id ?? assert(data.id);

  if (id === "" || id.length < 1) return false;
  if (
    (e?.nativeEvent as unknown as NativeEvent)?.submitter?.name === "delete"
  ) {
    window.bridge
      .removeDevice({ deviceId: assert(device).id })
      .catch(console.error)
      .then(() => setMode("overview"));
    return;
  }
  let auth = null;

  if (type === "node") {
    auth = false;
  } else if (data.authPassword !== undefined) {
    auth = { password: data.authPassword };
  }

  const updatedDevice: Device = {
    id,
    description: data.description,
    type: data.type,
    protocol: data.protocol,
    ip: data.ip,
    port: parseInt(data.port),
    mac: data.mac,
    tags: [],
    auth
  };
  if (JSON.stringify(updatedDevice) === JSON.stringify(device)) {
    setMode("overview");
  } else {
    window.bridge
      .addDevice({ device: updatedDevice })
      .catch(console.error)
      .then(() => setMode("overview"));
  }
};

const EditDevice = forwardRef<HTMLDialogElement, EditDeviceProps>(
  ({ device, setMode }, ref) => {
    const [type, setType] = useState<ServiceType>(device?.type ?? "node");
    const { register, handleSubmit } = useForm<Form>();
    const saveDevice = useCallback(
      (data: Form, e: BaseSyntheticEvent<object> | undefined) =>
        saveDevice_(device, setMode, type, data, e),
      [device, setMode, type]
    );

    return (
      <Dialog
        ref={ref}
        title="Edit Device"
        closeDialog={() => setMode("overview")}
      >
        <h2>{device === null ? "Register Device" : "Edit Device"}</h2>
        <form
          method="post"
          onSubmit={handleSubmit(saveDevice)}
          className={styles.form}
        >
          {device === null ? (
            <>
              <label htmlFor="id">ID</label>
              <input {...register("id")} type="text" />
            </>
          ) : null}
          <label htmlFor="description">Description</label>
          <input
            {...register("description")}
            type="text"
            defaultValue={device?.description}
          />
          <label htmlFor="type">Protocol</label>
          <select
            {...register("type")}
            defaultValue={type}
            onChange={e => setType(e.currentTarget.value as ServiceType)}
          >
            <option value="node">Node</option>
            <option value="pjlink">Protocol</option>
            <option value="mdc">Screen</option>
          </select>
          <label htmlFor="protocol">Protocol</label>
          <input
            {...register("protocol")}
            type="text"
            defaultValue={device?.protocol}
          />
          <label htmlFor="ip">IP</label>
          <input {...register("ip")} type="text" defaultValue={device?.ip} />
          <label htmlFor="port">Port</label>
          <input
            {...register("port")}
            type="number"
            defaultValue={device?.port}
          />
          <label htmlFor="mac">MAC Address</label>
          <input {...register("mac")} type="text" defaultValue={device?.mac} />
          {type !== "node" ? (
            <>
              <h4>Authentication</h4>
              <label htmlFor="authPassword">Password</label>
              <input {...register("authPassword")} type="password" />
            </>
          ) : null}
          <div className={styles["action-container"]}>
            <button type="submit" name="save" value="save">
              {device === null ? "Save" : "Update"}
            </button>
            {device !== null ? (
              <button
                type="submit"
                name="delete"
                value="delete"
                id={styles["delete"]}
              >
                Delete
              </button>
            ) : null}
          </div>
        </form>
      </Dialog>
    );
  }
);

EditDevice.displayName = "EditDevice";

export default EditDevice;
