import { useForm } from "react-hook-form";
import { useStore } from "../../../../store";

import styles from "./browsers.module.scss";

type Form = {
  url: string
  displayId: string
}

const BrowserIdInput = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setDeviceAction = useStore(state => state.hardwareConfig.setDeviceAction);
  const setBrowserConfig = useStore(state => state.hardwareConfig.setBrowserConfig);
  const { handleSubmit, register } = useForm<Form>();

  const onSubmit = (config: Form) => {
    setBrowserConfig({
      url: !config.url ? undefined : config.url,
      displayId: !config.displayId ? undefined : parseInt(config.displayId)
    });
    setDeviceAction({ ...deviceAction, pending: false });
  };

  return <div className={styles.input}>
    <h4>Get Browser Status For:</h4>
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label>URL</label>
        <input {...register("url")} type="text" />
      </fieldset>
      <fieldset>
        <label>Display ID</label>
        <input {...register("displayId")} type="number" />
      </fieldset>
      <button type="submit">SUBMIT</button>
    </form>
  </div>;
};

export default BrowserIdInput;
