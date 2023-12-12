import { type Space } from "../types";
import { useForm } from "react-hook-form";

import styles from "./space-config.module.scss";

type SpaceConfigProps = {
  space: Space & { update: (space: Space) => void }
}

const SpaceConfig = ({ space }: SpaceConfigProps) => {
  const {
    register,
    handleSubmit
  } = useForm<Space>({ defaultValues: space });

  return <section id={styles["space"]}>
    <h4>Space Config</h4>
    <form onSubmit={handleSubmit(space.update)}>
      <label className={styles.ratio}>
        Ratio:
        <fieldset>
          <input {...register("width")} type="number"
                 className={styles.left} />
          <p>:</p>
          <input {...register("height")} type="number" />
        </fieldset>
      </label>
      <label htmlFor="rows">Rows:</label>
      <input {...register("rows")} type="number" />
      <label htmlFor="cols">Columns:</label>
      <input {...register("columns")} type="number" />
      <button type="submit" />
    </form>
  </section>;
};

export default SpaceConfig;
