import {type Actions} from "../hooks";

import styles from "./actions.module.scss";

type ActionsProps = {
  setAction: (action: Actions | null) => void
}

const Actions = ({setAction}: ActionsProps) => <section id={styles["actions"]}>
  <h2>Actions</h2>
  <div className={styles.actions}>
    <button onClick={() => setAction("metadata")}>DETAILS</button>
    <button>LAUNCH</button>
    <button>SAVE</button>
  </div>
</section>;

export default Actions;
