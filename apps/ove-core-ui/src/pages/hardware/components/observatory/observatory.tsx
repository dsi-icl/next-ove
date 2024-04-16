import Header from "../header/header";
import { assert } from "@ove/ove-utils";
import Actions from "../actions/actions";
import { skipSingle } from "../../utils";
import Toolbar from "../toolbar/toolbar";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { columns } from "../data-table/columns";
import { type HardwareInfo } from "../../types";
import DataTable from "../data-table/data-table";
import React, { useMemo, useState } from "react";
import { is, isError, OVEExceptionSchema } from "@ove/ove-types";

import styles from "./observatory.module.scss";

export const useHardware = (isOnline: boolean, bridgeId: string) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const getHardware = trpc.bridge.getDevices
    .useQuery({ bridgeId }, { enabled: isOnline });
  const getStatus = trpc.hardware.getStatus.useQuery({
    bridgeId,
    deviceId: deviceAction.deviceId ?? ""
  }, { enabled: false });
  const getStatusAll = trpc.hardware.getStatusAll.useQuery({
    bridgeId
  }, { enabled: isOnline });

  const hardware = useMemo(() => {
    if (!isOnline || getHardware.status !== "success" ||
      is(OVEExceptionSchema, getHardware.data.response)) return [];

    const getSingleStatus = (deviceId: string) => {
      if (deviceAction.deviceId !== deviceId) return null;
      return getStatus.status === "success" &&
      !isError(getStatus.data.response) ? getStatus.data.response : null;
    };

    const getMultiStatus = (deviceId: string) => {
      if (getStatusAll.status !== "success" ||
        "oveError" in getStatusAll.data.response) return null;
      const response = assert(getStatusAll.data.response
        .find(({ deviceId: id }) => id === deviceId)).response;
      return !isError(response) ? response : null;
    };

    return getHardware.data.response.map(device => {
      const status = (!skipSingle("status", bridgeId, deviceAction) ?
        getSingleStatus(device.id) : getMultiStatus(device.id)) ?? "off";
      return ({
        device,
        status
      });
    });
  }, [isOnline, bridgeId, deviceAction, getHardware.status,
    getHardware.data?.response, getStatus.status, getStatus.data?.response,
    getStatusAll.status, getStatusAll.data?.response]);

  return { hardware };
};

const getData = (bridgeId: string, hardware: HardwareInfo[]) => hardware.map(({
  device,
  status
}) => {
  const deviceProtocol = device.protocol === undefined ? "" : `${device.protocol}://`;
  const devicePort = device.port === undefined ? "" : `:${device.port}`;
  return ({
    protocol: device.type,
    id: device.id,
    hostname: `${deviceProtocol}${device.ip}${devicePort}`,
    mac: device.mac,
    tags: device.tags,
    status: status,
    actions: <Actions device={device} bridgeId={bridgeId} />
  });
});

const Observatory = ({ name, isOnline }: {
  name: string
  isOnline: boolean
}) => {
  const { hardware } = useHardware(isOnline, name);
  const [filter, setFilter] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"id" | "tags">("id");

  return <section className={styles.observatory}>
    <Header name={name} isOnline={isOnline} />
    {isOnline ? <>
      <Toolbar filterType={filterType} hardware={hardware} filter={filter}
               setFilterType={setFilterType} setFilter={setFilter}
               name={name} />
      <div className={styles["table-container"]}>
        <DataTable columns={columns} filterType={filterType} filter={filter}
                   data={getData(name, hardware)} />
      </div>
    </> : null}
  </section>;
};

export default Observatory;
