import Info from "./info";
import { useStore } from "../../../../store";
import { type InfoTypes } from "../../../../utils";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./info.module.scss";

const InfoContainer = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const infoIdx = useStore(state => state.hardwareConfig.paginationIdx);
  const curInfo = useStore(state => state.hardwareConfig.info);
  const setInfo = useStore(state => state.hardwareConfig.setInfo);

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

  const getMaxLen = (obj: {data: object} | {data: object[]} | null) => {
    if (obj === null) return null;
    if ("length" in obj.data) return obj.data.length;
    return null;
  }

  return <PaginatedDialog data={curInfo?.data ?? null} maxLen={getMaxLen(curInfo)}>{curInfo !== null ? <div className={styles.container}>
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
