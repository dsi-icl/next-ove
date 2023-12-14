import { type Actions } from "../hooks";
import { useForm } from "react-hook-form";

import styles from "./launch-config.module.scss";

type LaunchConfigProps = {
  observatories: string[]
  setAction: (action: Actions | null) => void
}

const LaunchConfig = ({ observatories, setAction }: LaunchConfigProps) => {
  const { register, handleSubmit } = useForm<{ observatory: string }>();

  return <section id={styles["launch"]}>
    <h2>Launch Config</h2>
    <form onSubmit={handleSubmit(() => setAction("live"))}>
      <label htmlFor="presets">Presets:</label>
      <select {...register("observatory")}>
        {observatories.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
      <button>LAUNCH</button>
    </form>
  </section>;
};

export default LaunchConfig;
