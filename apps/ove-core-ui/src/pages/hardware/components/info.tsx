import { Json } from "@ove/ove-utils";

import styles from "./info.module.scss";

type InfoProps = {
  info: {
    deviceId: string
    data: object
  } | null
  close: () => void
}

const Info = ({info, close}: InfoProps) => {
  // TODO: add dropdown for info types
  return <div className={styles.info}>
    <h4>{info?.deviceId} - Info</h4>
    <table className={styles.dataframe}>
      <tbody>
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
      {info !== null ? Object.keys(info.data).map(k =>
        <tr key={k}>
          <th>{k}</th>
          <td>{Json.stringify(info.data[k as keyof typeof info["data"]])}</td>
        </tr>
      ) : null}
      </tbody>
    </table>
    <div className={styles.actions}>
      <button onClick={close}>Close</button>
    </div>
  </div>
};

export default Info;