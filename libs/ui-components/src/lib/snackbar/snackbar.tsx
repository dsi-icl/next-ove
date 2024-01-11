import React from "react";
import styles from "./snackbar.module.scss";

type SnackbarProps = {
  text: string
  show: boolean
}

const Snackbar = ({ text, show }: SnackbarProps) => show ?
  <div id={styles["snackbar"]}>{text}</div> : null;

export default Snackbar;
