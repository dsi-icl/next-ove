import styles from "./actions.module.scss";

const Actions = () => <section id={styles["actions"]}>
  <h2>Actions</h2>
  <div className={styles.actions}>
    <button>LAUNCH</button>
    <button>SAVE</button>
  </div>
</section>;

export default Actions;
