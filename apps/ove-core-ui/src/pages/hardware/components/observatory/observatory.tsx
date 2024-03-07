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

import styles from "./observatory.module.scss";

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
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState<"id" | "tags">("id");
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);

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
               name={name} />
      <div className={styles["table-container"]}>
        <DataTable columns={columns} filterType={filterType} filter={filter}
                   data={getData(name, hardware)} />
      </div>
    </> : null}
  </section>;
};

export default Observatory;
