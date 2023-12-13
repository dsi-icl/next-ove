import { type Space } from "../types";
import { useForm } from "react-hook-form";
import { type NativeEvent } from "@ove/ove-types";
import { type BaseSyntheticEvent, useRef } from "react";

import styles from "./space-config.module.scss";
import { Json } from "@ove/ove-utils";

type SpaceConfigProps = {
  space: Space & { update: (space: Space) => void }
  presets: { [key: string]: Space }
}

const SpaceConfig = ({ space: {update, ...curSpace}, presets }: SpaceConfigProps) => {
  const ref = useRef<HTMLFormElement | null>(null);
  const {
    register,
    handleSubmit,
    setValue
  } = useForm<Space & { preset: string | null }>({
    defaultValues: {
      ...curSpace,
      preset: null
    }
  });

  const onSubmit = (config: Space & {
    preset: string | null
  }, e: BaseSyntheticEvent<object> | undefined) => {
    const {preset, ...newSpace} = config;
    Object.keys(newSpace).forEach(x => {
      newSpace[x as keyof typeof newSpace] = parseFloat(newSpace[x as keyof typeof newSpace] as unknown as string);
    });
    if ((e?.nativeEvent as unknown as NativeEvent)?.submitter?.name === "custom-submit") {
      if (!Json.equals(newSpace, curSpace)) {
        setValue("preset", null);
      }
      update(newSpace);
      return;
    }

    if (preset === null) return;
    update(presets[preset]);
    setValue("width", presets[preset].width);
    setValue("height", presets[preset].height);
    setValue("rows", presets[preset].rows);
    setValue("columns", presets[preset].columns);
  };

  return <section id={styles["space"]}>
    <h2>Space Config</h2>
    <form ref={ref} onSubmit={handleSubmit(onSubmit)}>
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
      <button type="submit" id="custom-submit" name="custom-submit" />
      <label htmlFor="presets">Presets:</label>
      <select {...register("preset")}
              onChange={e => {
                setValue("preset", e.target.value);
                ref.current?.dispatchEvent(new Event("submit", {
                  cancelable: true,
                  bubbles: true
                }));
              }}>
        {Object.keys(presets).map(k => <option key={k} value={k}>{k}</option>)}
      </select>
      <button type="submit" id="preset-submit" name="preset-submit" />
    </form>
  </section>;
};

export default SpaceConfig;
