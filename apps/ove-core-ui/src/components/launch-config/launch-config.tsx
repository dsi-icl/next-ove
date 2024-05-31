import { z } from "zod";
import React from "react";
import { useForm } from "react-hook-form";
import type {
  LaunchConfig as LaunchConfigT
} from "../../pages/project-editor/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Project, Section } from "@prisma/client";

import styles from "./launch-config.module.scss";

type LaunchConfigProps = {
  observatories: string[]
  launch: (config: LaunchConfigT) => void
  project: Project,
  sections: Section[] | null
}

const LaunchConfigFormSchema = z.strictObject({
  observatory: z.string(),
  confirmation: z.boolean()
});

type LaunchConfigForm = z.infer<typeof LaunchConfigFormSchema>

const LaunchConfig = ({
  project,
  observatories,
  launch,
  sections
}: LaunchConfigProps) => {
  const { register, handleSubmit } = useForm<LaunchConfigForm>({
    resolver: zodResolver(LaunchConfigFormSchema)
  });

  const onSubmit = ({ observatory, confirmation }: LaunchConfigForm) => {
    if (!confirmation) return;
    launch({ projectId: project.id, observatory, layout: sections });
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
