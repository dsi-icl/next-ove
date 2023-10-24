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

const getData = (bridgeId: string, hardware: HardwareInfo[]) => hardware.map(({
  device,
  status
}) => ({
  protocol: device.type,
  id: device.id,
  hostname: device.ip,
  mac: device.mac,
  tags: device.tags,
  status: status,
  actions: <Actions device={device} bridgeId={bridgeId} />
}));

const Observatory = ({ name, isOnline, showNotification }: {
  name: string
  isOnline: boolean
  showNotification: (text: string) => void
}) => {
  const {
    hardware,
    updateStatus,
    updateStatusAll
  } = useHardware(isOnline, name);
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState<"id" | "tags">("id");
  const setDeviceAction = useStore(state => state.hardwareConfig.setDeviceAction);

  useSingleController(name, showNotification, updateStatus);
  useMultiController(name, filter, showNotification, updateStatusAll);

  useEffect(() => {
    if (filterType !== "id") return;
    setDeviceAction({
      bridgeId: name,
      action: null,
      deviceId: filter === "" ? null : filter,
      pending: false
    });
  }, [filter]);

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
