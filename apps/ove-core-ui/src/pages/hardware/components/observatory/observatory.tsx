import React from "react";
import Header from "../header/header";
import Actions from "../actions/actions";
import Toolbar from "../toolbar/toolbar";
import { useHardware } from "../../hooks";
import { useEffect, useState } from "react";
import { useStore } from "../../../../store";
import { columns } from "../data-table/columns";
import { type HardwareInfo } from "../../types";
import DataTable from "../data-table/data-table";
import { useMultiController } from "../controller/multi-hooks";
import { useSingleController } from "../controller/single-hooks";

import styles from "./observatory.module.scss";

const getData = (bridgeId: string, hardware: HardwareInfo[], refetch: {
  single: () => void,
  multi: () => void
}) => hardware.map(({
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
    actions: <Actions device={device} bridgeId={bridgeId} refetch={refetch} />
  });
});

const Observatory = ({ name, isOnline, showNotification }: {
  name: string
  isOnline: boolean
  showNotification: (text: string) => void
}) => {
  const {
    hardware,
    refetch
  } = useHardware(isOnline, name);
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState<"id" | "tags">("id");
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);

  useSingleController(name, showNotification);
  useMultiController(name, filter, showNotification);

  useEffect(() => {
    if (filterType !== "id") return;
    setDeviceAction({
      bridgeId: name,
      action: null,
      deviceId: filter === "" ? null : filter,
      pending: false
    });
  }, [filter, filterType, name, setDeviceAction]);

  return <section className={styles.observatory}>
    <Header name={name} isOnline={isOnline} />
    {isOnline ? <>
      <Toolbar filterType={filterType} hardware={hardware} filter={filter}
               setFilterType={setFilterType} setFilter={setFilter}
               refetch={refetch}
               name={name} />
      <div className={styles["table-container"]}>
        <DataTable columns={columns} filterType={filterType} filter={filter}
                   data={getData(name, hardware, refetch)} />
      </div>
    </> : null}
  </section>;
};

export default Observatory;
