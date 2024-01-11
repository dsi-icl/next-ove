import React from "react";
import { type Actions } from "../hooks";
import { toProject } from "../utils";
import { useForm } from "react-hook-form";
import { type Project, type Section } from "@prisma/client";

import styles from "./launch-config.module.scss";

type LaunchConfigProps = {
  observatories: string[]
  setAction: (action: Actions | null) => void
  project: Project,
  sections: Section[]
}

type LaunchConfigForm = {
  observatory: string
  confirmation: boolean
}

const LaunchConfig = ({
  observatories,
  setAction,
  project,
  sections
}: LaunchConfigProps) => {
  const { register, handleSubmit } = useForm<LaunchConfigForm>();

  const onSubmit = ({ observatory, confirmation }: LaunchConfigForm) => {
    if (!confirmation) return;
    console.log(`LAUNCHING ON ${observatory}`); // TODO: replace with launch
    toProject(project, sections);
    setAction("live");
  };

  return <section id={styles["launch"]}>
    <h2>Launch Config</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="presets">Presets:</label>
      <select {...register("observatory")}>
        {observatories.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
      <div className={styles.confirmation}>
        <div>
          <label htmlFor="confirmation">This observatory may be in use, please
            confirm:</label>
          <input {...register("confirmation")} type="checkbox" />
        </div>
        <button>LAUNCH</button>
      </div>
    </form>
  </section>;
};

export default LaunchConfig;
