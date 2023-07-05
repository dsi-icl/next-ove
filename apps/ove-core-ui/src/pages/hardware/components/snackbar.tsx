type SnackbarProps = {
  text: string
}

const Snackbar = ({ text }: SnackbarProps) => <div id="snackbar">{text}</div>;

export default Snackbar;