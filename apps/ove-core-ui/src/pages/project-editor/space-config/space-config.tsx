import { z } from "zod";
import { useForm } from "react-hook-form";
import { type Geometry, type Space } from "../types";
import React, { useRef } from "react";

import styles from "./space-config.module.scss";

type SpaceConfigProps = {
  space: {
    space: Space | null,
    cells: Geometry[] | null,
    update: (space: string) => void,
    name: string | null
  }
  presets: { [key: string]: Space }
}

const SpaceConfigFormSchema = z.strictObject({
  preset: z.string().nullable()
});

type SpaceConfigForm = z.infer<typeof SpaceConfigFormSchema>

const SpaceConfig = ({
  space: { update, name },
  presets
}: SpaceConfigProps) => {
  const ref = useRef<HTMLFormElement | null>(null);
  const {
    register,
    handleSubmit,
    setValue
  } = useForm<SpaceConfigForm>({
    defaultValues: {
      preset: name ?? "-- select an option --"
    }
  });

  const onSubmit = ({ preset }: {
    preset: string | null
  }) => {
    if (preset === null || preset === "-- select an option --") return;
    update(preset);
  };

  return <section id={styles["space"]}>
    <form ref={ref} onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="presets">Observatory</label>
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
    </form>
  </section>;
};

export default SpaceConfig;
