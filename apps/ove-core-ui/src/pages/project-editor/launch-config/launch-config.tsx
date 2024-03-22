import { z } from "zod";
import React from "react";
import { type Actions } from "../hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Project, type Section } from "@prisma/client";

import styles from "./launch-config.module.scss";

type LaunchConfigProps = {
  observatories: string[]
  setAction: (action: Actions | null) => void
  project: Project,
  sections: Section[]
}

const LaunchConfigFormSchema = z.strictObject({
  observatory: z.string(),
  confirmation: z.boolean()
});

type LaunchConfigForm = z.infer<typeof LaunchConfigFormSchema>

const LaunchConfig = ({
  observatories,
  setAction
}: LaunchConfigProps) => {
  const { register, handleSubmit } = useForm<LaunchConfigForm>({
    resolver: zodResolver(LaunchConfigFormSchema)
  });

  const onSubmit = ({ observatory, confirmation }: LaunchConfigForm) => {
    if (!confirmation) return;
    console.log(`LAUNCHING ON ${observatory}`); // TODO: replace with launch
    setAction("live");
  };

  return <section id={styles["launch"]}>
    <h2>Launch Config</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="presets">Presets:</label>
      <select {...register("observatory", { required: true })}>
        {observatories.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
      <div className={styles.confirmation}>
        <div>
          <label htmlFor="confirmation">This observatory may be in use, please
            confirm:</label>
          <input {...register("confirmation", { required: true })}
                 type="checkbox" />
        </div>
        <button>LAUNCH</button>
      </div>
    </form>
  </section>;
};

export default LaunchConfig;
