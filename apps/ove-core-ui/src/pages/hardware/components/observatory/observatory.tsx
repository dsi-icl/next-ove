import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import {
  CameraVideo,
  Calendar
} from "react-bootstrap-icons";
import Info from "../info";
import { Dialog, Snackbar, useDialog, useSnackbar } from "@ove/ui-components";
import Console from "../console";
import Actions from "../actions";
import { HardwareInfo, useHardware } from "../../hooks/hooks";
import { assert } from "@ove/ove-utils";

import styles from "./observatory.module.scss";
import LiveView from "../live-view/live-view";
import DataTable from "../../../../components/data-table/data-table";
import { columns } from "../../../../components/data-table/columns";
import { useForm } from "react-hook-form";

export type ObservatoryProps = {
  name: string
  isOnline: boolean
}

const getData = (hardware: HardwareInfo[], bridgeId: string, openConsole: () => void, showNotification: (text: string) => void, updateHardware: <Key extends keyof HardwareInfo>(deviceId: string, [k, v]: [Key, HardwareInfo[Key]]) => void, setDeviceInfo: (deviceId: string) => void) => hardware.map(({ device, status }) => ({
  protocol: device.type,
  id: device.id,
  hostname: device.ip,
  mac: device.mac,
  tags: device.tags,
  status: status,
  actions: <Actions openConsole={openConsole}
                    showNotification={showNotification}
                    name={bridgeId} updateHardware={updateHardware}
                    device={device}
                    selectInfo={() => setDeviceInfo(device.id)} />
}));

const Header = ({ name, openVideoDialog, isOnline }: { name: string, openVideoDialog: () => void, isOnline: boolean }) =>
  <div className={styles.header}>
    <h2>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {isOnline ? <div className={styles.actions}>
      <button className={styles.icon} onClick={openVideoDialog}>
        <CameraVideo /></button>
      <button className={styles.icon}><Calendar /></button>
    </div> : null}
  </div>;

type PopupsProps = {
  infoDialog: MutableRefObject<HTMLDialogElement | null>,
  hardware: HardwareInfo[]
  name: string
  deviceInfo: string | null
  closeInfo: () => void
  setDeviceInfo: (deviceInfo: string | null) => void
  consoleDialog: MutableRefObject<HTMLDialogElement | null>
  closeConsole: () => void
  closeVideoDialog: () => void
  videoDialog: MutableRefObject<HTMLDialogElement | null>
  videoDialogIsOpen: boolean
  notification: string
  isVisible: boolean
}

const Popups = (props: PopupsProps) => <>
  <Dialog ref={props.infoDialog} closeDialog={props.closeInfo}
          title="Device Information">
    {props.deviceInfo !== null ? <Info
      device={assert(props.hardware.find(({ device: { id } }) => id === props.deviceInfo)).device}
      bridgeId={props.name} close={() => {
      props.setDeviceInfo(null);
    }} /> : null}
  </Dialog>
  <Dialog ref={props.consoleDialog} closeDialog={props.closeConsole}
          title="Console">
    <Console close={props.closeConsole} />
  </Dialog>
  <Dialog closeDialog={props.closeVideoDialog} title="Video Monitoring"
          ref={props.videoDialog}
          style={{ width: "90vw", maxHeight: "unset", height: "90vh" }}>
    <LiveView bridgeId={props.name} isOpen={props.videoDialogIsOpen} />
  </Dialog>
  <Snackbar text={props.notification ?? ""} show={props.isVisible} />
</>;

type SearchSelectProps = {
  values: string[]
  setFilter: (filter: string) => void
  filter: string
}

const SearchSelect = ({ values, setFilter, filter }: SearchSelectProps) => {
  const ref = useRef<HTMLFormElement | null>(null);
  const { handleSubmit, watch, setValue, register } = useForm<{ filter: string }>();

  const onSubmit = useCallback(({ filter }: { filter: string }) => {
    setFilter(filter);
  }, []);

  useEffect(() => {
    const data = watch(() => handleSubmit(onSubmit)());
    return () => data.unsubscribe();
  }, []);

  return <form ref={ref} className={styles.selector}
               onSubmit={handleSubmit(onSubmit)}>
    <input className={styles.input} {...register("filter")} type="text"
           autoComplete="off" />
    <button type="submit" className={styles.hidden} />
    <div className={styles.dropdown}>
      <ul>
        {values.filter(v => v.startsWith(filter)).map(v => <li key={v}>
          <button onClick={() => setValue("filter", v)}
                  type="submit">{v}</button>
        </li>)}
      </ul>
    </div>
  </form>;
};

type ToolbarProps = {
  hardware: HardwareInfo[]
  setFilterType: (type: "id" | "tags") => void
  setFilter: (filter: string) => void
  filterType: "id" | "tags"
  filter: string
}

const Toolbar = ({ hardware, setFilterType, setFilter, filterType, filter }: ToolbarProps) => {
  return <div className={styles.toolbar}>
    <p>Filter by</p>
    <div className={styles["filter-type-container"]}>
      <button className={filterType === "id" ? styles.active : undefined}
              onClick={() => setFilterType("id")}>ID
      </button>
      <button className={filterType === "tags" ? styles.active : undefined}
              onClick={() => setFilterType("tags")}>Tags
      </button>
    </div>
    <SearchSelect setFilter={setFilter} filter={filter}
                  values={hardware.flatMap(({ device: { id, tags } }) => filterType === "id" ? [id] : tags)} />
  </div>;
};

const Observatory = ({ name, isOnline }: ObservatoryProps) => {
  const {
    ref: consoleDialog,
    closeDialog: closeConsole,
    openDialog: openConsole
  } = useDialog();
  const {
    ref: infoDialog,
    closeDialog: closeInfo,
    openDialog: openInfo
  } = useDialog();
  const {
    ref: videoDialog,
    closeDialog: closeVideoDialog,
    openDialog: openVideoDialog,
    isOpen: videoDialogIsOpen
  } = useDialog();
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null);
  const { hardware, updateHardware } = useHardware(isOnline, name);
  const { notification, show: showNotification, isVisible } = useSnackbar();
  const [filter, setFilter] = useState<string>("");
  const [filterType, setFilterType] = useState<"id" | "tags">("id");

  useEffect(() => {
    if (deviceInfo === null) {
      closeInfo();
    } else {
      openInfo();
    }
  }, [deviceInfo]);

  return <section className={styles.observatory}>
    <Header name={name} isOnline={isOnline} openVideoDialog={openVideoDialog} />
    {isOnline ? <>
      <Toolbar filterType={filterType} hardware={hardware} filter={filter}
               setFilterType={setFilterType} setFilter={setFilter} />
      <div className={styles["table-container"]}>
        <DataTable columns={columns} filterType={filterType} filter={filter}
                   data={getData(hardware, name, openConsole, showNotification, updateHardware, setDeviceInfo)} />
      </div>
      <Popups infoDialog={infoDialog} hardware={hardware} name={name}
              deviceInfo={deviceInfo} closeInfo={closeInfo}
              setDeviceInfo={setDeviceInfo} consoleDialog={consoleDialog}
              closeConsole={closeConsole} closeVideoDialog={closeVideoDialog}
              videoDialog={videoDialog} videoDialogIsOpen={videoDialogIsOpen}
              notification={notification} isVisible={isVisible} />
    </> : null}
  </section>;
};

export default Observatory;