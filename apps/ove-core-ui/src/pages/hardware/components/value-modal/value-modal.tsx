import { z } from "zod";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, Path, useForm } from "react-hook-form";

import styles from "./value-modal.module.scss";

type ValueModalProps<T> = {
  k: Path<T>
  schema: z.ZodType<T>
  label: string
  header: string
  onSubmit: (form: T) => void
}

const ValueModal = <T extends FieldValues>({
  k,
  schema,
  label,
  header,
  onSubmit
}: ValueModalProps<T>) => {
  const { handleSubmit, register } = useForm<T>({
    resolver: zodResolver(schema)
  });

  return <div className={styles.input}>
    <h4>{header}</h4>
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label>{label}</label>
        <input {...register(k, { required: true, valueAsNumber: true })}
               type="number" />
      </fieldset>
      <button type="submit">SUBMIT</button>
    </form>
  </div>;
};

export default ValueModal;
