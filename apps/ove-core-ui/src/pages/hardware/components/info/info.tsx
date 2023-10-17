import { Json } from "@ove/ove-utils";

import styles from "./info.module.scss";

const Info = ({ info }: { info: object }) => <div className={styles.info}>
  <table className={styles.dataframe}>
    <tbody>
    <tr>
      <th>Property</th>
      <th>Value</th>
    </tr>
    {Object.keys(info).map(k =>
      <tr key={k}>
        <th>{k}</th>
        <td style={{ maxWidth: "30vw" }}><p style={{
          maxWidth: "20vw",
          overflowWrap: "break-word"
        }}>{Json.stringify(info[k as keyof typeof info])}</p></td>
      </tr>
    )}
    </tbody>
  </table>
</div>;

export default Info;