import styles from './ove-bridge-ui.module.scss';

/* eslint-disable-next-line */
export interface OveBridgeUiProps {}

export function OveBridgeUi(props: OveBridgeUiProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to OveBridgeUi!</h1>
    </div>
  );
}

export default OveBridgeUi;
