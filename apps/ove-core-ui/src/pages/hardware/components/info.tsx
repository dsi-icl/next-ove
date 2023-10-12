import { Json, assert } from "@ove/ove-utils";

import styles from "./info.module.scss";
import { useState } from "react";
import { Device, isError } from "@ove/ove-types";
import { trpc } from "../../../utils/api";

type InfoProps = {
  device: Device
  close: () => void
  bridgeId: string
}

const Info = ({ device, bridgeId, close }: InfoProps) => {
  const [type, setType] = useState<string | undefined>();
  const info = trpc.hardware.getInfo.useQuery({type, bridgeId, deviceId: device.id});

  return <div className={styles.info}>
    <h4>{device.id} - Info</h4>
    {device.type === "node" ? <><label htmlFor="type">INFO TYPE</label>
      <select id="type" name="type" defaultValue="general" onChange={e => setType(e.currentTarget.value)}>
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
      </select></> : null}
    <table className={styles.dataframe}>
      <tbody>
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
      {info.status === "success" && !isError(info.data.response) ? Object.keys(info.data.response).map(k =>
        <tr key={k}>
          <th>{k}</th>
          <td style={{maxWidth: "30vw"}}><p style={{maxWidth: "20vw", overflowWrap: "break-word"}}>{Json.stringify(assert(info.data.response)[k as keyof typeof info["data"]["response"]])}</p></td>
        </tr>
      ) : null}
      </tbody>
    </table>
    <div className={styles.actions}>
      <button onClick={close}>Close</button>
    </div>
  </div>;
};

export default Info;