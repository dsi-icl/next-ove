import styles from "./info.module.scss";
import { Json } from "@ove/ove-utils";

type InfoProps = {
  info: {
    deviceId: string
    data: object
  }
  close: () => void
}

const Info = ({info, close}: InfoProps) => {
  // TODO: add dropdown for info types
  return <>
    <h4 style={{ color: "black", width: "100%", textAlign: "center", fontWeight: "700", fontSize: "16px" }}>{info.deviceId} - Info</h4>
    <table className={styles.dataframe} style={{marginTop: "1rem"}}>
      <tbody>
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
      {Object.keys(info.data).map(k =>
        <tr key={k}>
          <th>{k}</th>
          <td>{Json.stringify(info.data[k as keyof typeof info["data"]])}</td>
        </tr>
      )}
      </tbody>
    </table>
    <div style={{display: "flex", justifyContent: "end", marginTop: "1rem"}}>
      <button onClick={close} style={{backgroundColor: "#002147", color: "white", padding: "0.5rem", borderRadius: "20px"}}>Close</button>
    </div>
  </>
};

export default Info;