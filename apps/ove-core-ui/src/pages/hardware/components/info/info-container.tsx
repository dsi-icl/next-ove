import Info from "./info";
import { type DeviceAction } from "../../types";
import { type InfoTypes, useStore } from "../../../../store";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./info.module.scss";

const InfoContainer = ({ deviceAction }: {
  deviceAction: DeviceAction
}) => {
  const infoIdx = useStore(state => state.paginationIdx);
  const curInfo = useStore(state => state.info);
  const setInfo = useStore(state => state.setInfo);

  let info: object | null = null;
  let deviceId: string | null = null;

  if (curInfo !== null) {
    if ("length" in curInfo.data) {
      if (!("oveError" in curInfo.data[infoIdx])) {
        info = (curInfo.data[infoIdx] as { response: object }).response;
        deviceId = (curInfo.data[infoIdx] as {deviceId: string}).deviceId;
      }
    } else {
      info = curInfo.data;
      deviceId = deviceAction.deviceId;
    }
  }

  return <PaginatedDialog data={curInfo?.data ?? null}>{curInfo !== null ? <div className={styles.container}>
    <div className={styles.header}>
      <h4>Info - {deviceId}</h4>
      <label htmlFor="type">INFO TYPE:</label>
      <select id="type" name="type" defaultValue="general"
              onChange={e => setInfo({
                ...curInfo,
                type: e.currentTarget.value as InfoTypes
              })}>
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
    {info === null ? <div>ERROR</div> : <Info info={info} />}
  </div> : null}</PaginatedDialog>;
};

export default InfoContainer;
