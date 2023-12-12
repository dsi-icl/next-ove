import { useForm } from "react-hook-form";
import { type Section } from "@prisma/client";

import styles from "./section-config.module.scss";
import { useEffect } from "react";

type SectionConfigProps = {
  sections: Section[]
  selected: string | null
  reorder: (id: string, blueMonday: number) => void
}

type SectionConfigForm = Omit<Section, "id">

const SectionConfig = ({ sections, selected, reorder }: SectionConfigProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    resetField
  } = useForm<SectionConfigForm>();

  useEffect(() => {
    if (selected === null) {
      resetField("ordering");
      resetField("x");
      resetField("y");
      resetField("width");
      resetField("height");
      return;
    }

    const section = sections.find(section => section.id === selected)!;
    setValue("ordering", section.ordering);
    setValue("x", section.x);
    setValue("y", section.y);
    setValue("width", section.width);
    setValue("height", section.height);
  }, [selected, sections]);

  const onSubmit = (config: SectionConfigForm) => {
    if (selected === null) return;
    reorder(selected, config.ordering);
  };

  return <section id={styles["section-config"]}>
    <h2>Section Config</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label htmlFor="x">x:</label>
        <input {...register("x")} />
        <label htmlFor="y">y:</label>
        <input {...register("y")} />
        <label htmlFor="ordering">Order:</label>
        <input {...register("ordering")} />
      </fieldset>
      <fieldset>
        <label htmlFor="width">Width:</label>
        <input {...register("width")} />
        <label htmlFor="height">Height:</label>
        <input {...register("height")} />
      </fieldset>
      <button type="submit" />
    </form>
  </section>;
};

export default SectionConfig;
