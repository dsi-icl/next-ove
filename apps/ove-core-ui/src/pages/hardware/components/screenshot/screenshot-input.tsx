import { useState } from "react";
import { useForm } from "react-hook-form";
import { useStore } from "../../../../store";
import { type ScreenshotMethod } from "@ove/ove-types";

import styles from "./screenshot.module.scss";

type Form = {
  method: ScreenshotMethod,
  screen: string
}

const ScreenshotInput = () => {
  const [screens, setScreens] = useState<string[]>([]);
  const { register, handleSubmit, setValue } = useForm<Form>();
  const setScreenshotConfig = useStore(state => state.hardwareConfig.setScreenshotConfig);
  const setDeviceAction = useStore(state => state.hardwareConfig.setDeviceAction);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  const onSubmit = ({ method, screen }: Form) => {
    if (screen !== "") {
      setScreens(cur => cur.includes(screen) ? cur : [...cur, screen]);
      setValue("screen", "");
    } else {
      setScreenshotConfig({method, screens: screens.map(screen => parseInt(screen))});
      setDeviceAction({...deviceAction, pending: false});
    }
  };

  return <div className={styles.input}>
    <h4>Screenshot Config</h4>
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label htmlFor="method">Save Method</label>
        <select {...register("method")}>
          <option value="response">Response</option>
          <option value="upload">Upload</option>
          <option value="local">Local</option>
        </select>
      </fieldset>
      <fieldset>
        <label>Screens</label>
        <ul className={styles.tags}>
          {screens.map(screen => <li key={screen}
                                     className={styles.saved}>{screen}</li>)}
          <li key="input"><input {...register("screen")} /></li>
        </ul>
      </fieldset>
      <button name="submit" type="submit">SUBMIT</button>
    </form>
  </div>;
};

export default ScreenshotInput;
