import React from "react";
import { FieldValues, Path, useForm } from "react-hook-form";

import styles from "./value-modal.module.scss";

type ValueModalProps<T> = {
  k: Path<T>
  label: string
  header: string
  onSubmit: (form: T) => void
}

const ValueModal = <T extends FieldValues, >({
  k,
  label,
  header,
  onSubmit
}: ValueModalProps<T>) => {
  const { handleSubmit, register } = useForm<T>();

  return <div className={styles.input}>
    <h4>{header}</h4>
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label>{label}</label>
        <input {...register(k, { required: true })} type="number" />
      </fieldset>
      <button type="submit">SUBMIT</button>
    </form>
  </div>;
};

export default ValueModal;
