import styles from "./snackbar.module.scss";

type SnackbarProps = {
  text: string
}

const Snackbar = ({ text }: SnackbarProps) => <div id={styles["snackbar"]}>{text}</div>;

export default Snackbar;