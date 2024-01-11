import { z } from "zod";
import { toast } from "sonner";
import { Json } from "@ove/ove-utils";
import { useForm } from "react-hook-form";
import { type Geometry, type Rect, type Space } from "../types";
import { type NativeEvent } from "@ove/ove-types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { type BaseSyntheticEvent, useEffect, useRef } from "react";

import styles from "./space-config.module.scss";

type SpaceConfigProps = {
  space: Space & { cells: Geometry[], update: (space: Space) => void }
  presets: { [key: string]: Space }
}

const getPreset = (presets: { [key: string]: Space }, curSpace: Space) => {
  const reduced = reduce(curSpace);
  const elem = Object.entries(presets).find(([_k, v]) => {
    const presetReduced = reduce(v);
    return presetReduced.height === reduced.height &&
      presetReduced.width === reduced.width &&
      v.columns === curSpace.columns && v.rows === curSpace.rows;
  });
  return elem?.[0] ?? "-- select an option --";
};

const reduce = (rect: Rect): Rect => {
  const hcf = gcd(rect.width, rect.height);
  return ({ ...rect, width: rect.width / hcf, height: rect.height / hcf });
};

const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;

const SpaceConfigSchema = z.strictObject({
  width: z.number(),
  height: z.number(),
  rows: z.number(),
  columns: z.number(),
  preset: z.string().nullable()
});

const SpaceConfig = ({
  space: { update, cells, ...curSpace },
  presets
}: SpaceConfigProps) => {
  const ref = useRef<HTMLFormElement | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<Space & { preset: string | null }>({
    resolver: zodResolver(SpaceConfigSchema),
    defaultValues: {
      ...reduce(curSpace),
      preset: getPreset(presets, curSpace)
    }
  });

  useEffect(() => {
    Object.values(errors).forEach(error => {
      toast.error(error?.message);
    });
  }, [errors]);

  const onSubmit = (config: Space & {
    preset: string | null
  }, e: BaseSyntheticEvent<object> | undefined) => {
    const { preset, ...newSpace } = config;
    if ((e?.nativeEvent as unknown as NativeEvent)
      ?.submitter?.name !== undefined) {
      if (!Json.equals(newSpace, curSpace)) {
        setValue("preset", getPreset(presets, newSpace));
      }
      update(newSpace);
      return;
    }

    if (preset === null || preset === "-- select an option --") return;
    update(presets[preset]);
    const reduced = reduce(presets[preset]);
    setValue("width", reduced.width);
    setValue("height", reduced.height);
    setValue("rows", presets[preset].rows);
    setValue("columns", presets[preset].columns);
  };

  return <section id={styles["space"]}>
    <h2>Space Config</h2>
    <form ref={ref} onSubmit={handleSubmit(onSubmit)}>
      <div id={styles["custom-container"]}>
        <fieldset className={styles.col}>
          <label>
            Ratio:
            <fieldset className={styles.ratio}>
              <input {...register("width", { valueAsNumber: true })}
                     type="number" className={styles.left} />
              <p>:</p>
              <input {...register("height", { valueAsNumber: true })}
                     type="number" />
              <button type="submit" style={{ display: "none" }}></button>
            </fieldset>
          </label>
          <label htmlFor="presets">Presets:</label>
          <select {...register("preset")}
                  onChange={e => {
                    setValue("preset", e.target.value);
                    ref.current?.dispatchEvent(new Event("submit", {
                      cancelable: true,
                      bubbles: true
                    }));
                  }}>
            <option disabled value="-- select an option --">-- select an option
              --
            </option>
            {Object.keys(presets).map(k => <option key={k}
                                                   value={k}>{k}</option>)}
          </select>
        </fieldset>
        <fieldset className={styles.col}>
          <label htmlFor="rows">Rows:</label>
          <input {...register("rows", { valueAsNumber: true })} type="number" />
          <label htmlFor="cols">Columns:</label>
          <input {...register("columns", { valueAsNumber: true })}
                 type="number" />
          <button type="submit" id={styles["custom-submit"]}
                  name="custom-submit" />
        </fieldset>
      </div>
      <button type="submit" id="preset-submit" name="preset-submit">UPDATE
      </button>
    </form>
  </section>;
};

export default SpaceConfig;
