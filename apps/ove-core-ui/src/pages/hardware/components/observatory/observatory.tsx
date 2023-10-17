import Header from "../header/header";
import Popups from "../popups/popups";
import Actions from "../actions/actions";
import Toolbar from "../toolbar/toolbar";
import { useHardware } from "../../hooks";
import { useEffect, useState } from "react";
import { useStore } from "../../../../store";
import { columns } from "../data-table/columns";
import DataTable from "../data-table/data-table";
import { useController } from "../controller/controller";
import { type DeviceAction, type HardwareInfo } from "../../types";
import { Dialog, Snackbar, useDialog, useSnackbar } from "@ove/ui-components";

import styles from "./observatory.module.scss";

const getData = (hardware: HardwareInfo[], setDeviceAction: (deviceAction: DeviceAction) => void) => hardware.map(({
  device,
  status
}) => ({
  protocol: device.type,
  id: device.id,
  hostname: device.ip,
  mac: device.mac,
  tags: device.tags,
  status: status,
  actions: <Actions device={device} setDeviceAction={setDeviceAction} />
}));

const Observatory = ({ name, isOnline }: {
  name: string,
  isOnline: boolean
}) => {
  const { ref, closeDialog, openDialog } = useDialog();
  const setPaginationIdx = useStore(state => state.setPaginationIdx);
  const {
    hardware,
    updateStatus,
    updateStatusAll
  } = useHardware(isOnline, name);
  const { notification, show: showNotification, isVisible } = useSnackbar();
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState<"id" | "tags">("id");
  const [deviceAction, setDeviceAction] = useState<DeviceAction>({
    action: null,
    deviceId: null,
    pending: false
  });

  useController(deviceAction, name, filter, updateStatus, updateStatusAll, showNotification);

  useEffect(() => {
    setPaginationIdx(0);
    if (deviceAction.action !== "info" && !deviceAction.pending) return;
    if (deviceAction.action === null) {
      closeDialog();
    } else {
      openDialog();
    }
  }, [deviceAction]);

  useEffect(() => {
    if (filterType !== "id") return;
    setDeviceAction({
      action: null,
      deviceId: filter === "" ? null : filter,
      pending: false
    });
  }, [filter]);

  return <section className={styles.observatory}>
    <Header name={name} isOnline={isOnline} setDeviceAction={setDeviceAction} />
    {isOnline ? <>
      <Toolbar filterType={filterType} hardware={hardware} filter={filter}
               setDeviceAction={setDeviceAction}
               setFilterType={setFilterType} setFilter={setFilter} />
      <div className={styles["table-container"]}>
        <DataTable columns={columns} filterType={filterType} filter={filter}
                   data={getData(hardware, setDeviceAction)} />
      </div>
      <Dialog closeDialog={closeDialog} ref={ref}
              title={deviceAction.deviceId ?? ""}>
        <Popups name={name} deviceAction={deviceAction}
                close={() => setDeviceAction({
                  action: null,
                  deviceId: null,
                  pending: false
                })} />
      </Dialog>
      <Snackbar text={notification ?? ""} show={isVisible} />
    </> : null}
  </section>;
};

export default Observatory;
