import styles from "./info-dialog.module.scss";
import { forwardRef } from "react";

type DeviceInfo = {
  deviceId: string
  data: object
}

type InfoDialogProps = {
  info: {
    deviceId: string
    data: object
  }
  setInfo: (data: DeviceInfo | null) => void
}

const InfoDialog = forwardRef<HTMLDialogElement, InfoDialogProps>(({info, setInfo}, ref) => {
  // TODO: add dropdown for info types
  return <dialog ref={ref} style={{width: "30vw", padding: "2rem"}} title="test">
    <h4 style={{ color: "black", width: "100%", textAlign: "center", fontWeight: "700", fontSize: "16px" }}>{info.deviceId} - Info</h4>
    <table className={styles.dataframe} style={{marginTop: "1rem"}}>
      <tbody>
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
      {Object.keys(info.data).map(k =>
        <tr key={`${k}-row`}>
          <th key={`${k}-th`}>{k}</th>
          <td key={`${k}-td`}>{JSON.stringify(info.data[k as keyof typeof info["data"]])}</td>
        </tr>
      )}
      </tbody>
    </table>
    <div style={{display: "flex", justifyContent: "end", marginTop: "1rem"}}>
      <button onClick={() => setInfo(null)} style={{backgroundColor: "#002147", color: "white", padding: "0.5rem", borderRadius: "20px"}}>Close</button>
    </div>
  </dialog>
});

export default InfoDialog;