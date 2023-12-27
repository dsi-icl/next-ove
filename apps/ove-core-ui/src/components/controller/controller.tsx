import {
  ArrowClockwise,
  FileEarmarkText,
  Gear,
  XLg
} from "react-bootstrap-icons";

import styles from "./controller.module.scss";

const Controller = () => <section id={styles["controller"]}>
  <nav>
    <button className={styles.align}><FileEarmarkText /></button>
    <button><Gear /></button>
    <button><ArrowClockwise /></button>
    <button><XLg /></button>
  </nav>
</section>;

export default Controller;
