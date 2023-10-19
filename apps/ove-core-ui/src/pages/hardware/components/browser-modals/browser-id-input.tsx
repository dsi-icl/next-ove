import { useForm } from "react-hook-form";
import { useStore } from "../../../../store";

import styles from "./browsers.module.scss";

const BrowserIdInput = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setDeviceAction = useStore(state => state.hardwareConfig.setDeviceAction);
  const setBrowserId = useStore(state => state.hardwareConfig.setBrowserId);
  const { handleSubmit, register } = useForm<{ browserId: string }>();

  const onSubmit = ({ browserId }: { browserId: string }) => {
    setBrowserId(parseInt(browserId));
    setDeviceAction({ ...deviceAction, pending: false });
  };

  return <div className={styles.input}>
    <h4>Get Browser Status For:</h4>
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label>Browser ID</label>
        <input {...register("browserId", { required: true })} type="number" />
      </fieldset>
      <button type="submit">SUBMIT</button>
    </form>
  </div>;
};

export default BrowserIdInput;
