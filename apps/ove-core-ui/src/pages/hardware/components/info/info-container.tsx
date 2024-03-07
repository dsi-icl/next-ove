import Info from "./info";
import { useInfo } from "../../hooks";
import { assert } from "@ove/ove-utils";
import React, { useState } from "react";
import { type InfoTypes } from "../../../../utils";
import PaginatedDialog from "../paginated-dialog/paginated-dialog";

import styles from "./info.module.scss";

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
