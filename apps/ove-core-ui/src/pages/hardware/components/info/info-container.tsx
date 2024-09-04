import Info from "./info";
import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import React, { useState } from "react";
import { isError } from "@ove/ove-types";
import { api } from "../../../../utils/api";
import { useStore } from "../../../../store";
import type { InfoTypes } from "../../../../utils";
import { skipMulti, skipSingle } from "../../utils";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./info.module.scss";

export const useInfo = () => {
  const [type, setType] = useState<InfoTypes | undefined>();
  const [info, setInfo] = useState<Map<number, {
    deviceId: string,
    response: object | null
  }>>(new Map());
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  api.hardware.getInfo.useQuery({
    bridgeId: assert(deviceAction.bridgeId),
    deviceId: deviceAction.deviceId ?? "",
    type: type
  }, {
    enabled: !skipSingle(
      "info", deviceAction.bridgeId ?? "", deviceAction),
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error(`Cannot get information for ${deviceAction.deviceId}`);
      }

      const map: typeof info = new Map();

      map.set(0, {
        deviceId: deviceAction.deviceId ?? "",
        response: isError(response) ? null : response as object
      });

      setInfo(map);
    },
    onError: () => toast.error(
      `Cannot get information for ${deviceAction.deviceId}`)
  });
  api.hardware.getInfoAll.useQuery({
    bridgeId: assert(deviceAction.bridgeId),
    type,
    tag: deviceAction.tag
  }, {
    enabled: !skipMulti(
      "info", deviceAction.bridgeId ?? "", deviceAction),
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Cannot get information for devices");
        return;
      }

      const map: typeof info = new Map();

      response.forEach(({ deviceId, response }, i) => {
        map.set(i, {
          deviceId,
          response: isError(response) ? null : response as object
        });
      });

      setInfo(map);
    },
    onError: () => toast.error("Cannot get information for devices")
  });

  return {
    info,
    type,
    setType
  };
};

const InfoContainer = () => {
  const [idx, setIdx] = useState(0);
  const { info, type, setType } = useInfo();

  return <PaginatedDialog maxLen={info.size} idx={idx} setIdx={setIdx}>
    {info.size > 0 ?
      <div className={styles.container}>
        <div className={styles.header}>
          <h4>Info - {assert(info.get(idx)).deviceId}</h4>
          <label htmlFor="type">INFO TYPE:</label>
          <select id="type" name="type" defaultValue={type ?? "general"}
                  onChange={e => setType(e.currentTarget.value as InfoTypes)}>
            <option value="general">General</option>
            <option value="system">System</option>
            <option value="cpu">CPU</option>
            <option value="memory">Memory</option>
            <option value="battery">Battery</option>
            <option value="graphics">Graphics</option>
            <option value="os">OS</option>
            <option value="processes">Processes</option>
            <option value="fs">FS</option>
            <option value="usb">USB</option>
            <option value="printer">Printer</option>
            <option value="audio">Audio</option>
            <option value="network">Network</option>
            <option value="wifi">Wifi</option>
            <option value="bluetooth">Bluetooth</option>
            <option value="docker">Docker</option>
            <option value="vbox">Vbox</option>
          </select>
        </div>
        {assert(info.get(idx)).response !== null ?
          <Info info={assert(info.get(idx)?.response)}
                size={info.size} /> : null}
      </div> : null}</PaginatedDialog>;
};

export default InfoContainer;
