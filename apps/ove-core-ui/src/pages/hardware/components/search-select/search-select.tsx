import { useForm } from "react-hook-form";
import React, { useCallback, useEffect, useRef } from "react";

import styles from "./search-select.module.scss";

type SearchSelectProps = {
  values: string[]
  setFilter: (filter: string) => void
  filter: string
}

const SearchSelect = ({ values, setFilter, filter }: SearchSelectProps) => {
  const ref = useRef<HTMLFormElement | null>(null);
  const { handleSubmit, watch, setValue, register } = useForm<{
    filter: string
  }>();

  const onSubmit = useCallback(({ filter }: { filter: string }) => {
    setFilter(filter);
  }, [setFilter]);

  useEffect(() => {
    const data = watch(() => handleSubmit(onSubmit)());
    return () => data.unsubscribe();
  }, [handleSubmit, onSubmit, watch]);

  return <form ref={ref} className={styles.selector}
               onSubmit={handleSubmit(onSubmit)}>
    <input className={styles.input} {...register("filter")} type="text"
           autoComplete="off" />
    <button type="submit" className={styles.hidden} />
    <div className={styles.dropdown}>
      <ul>
        {values.filter(v => v.startsWith(filter)).map(v => <li key={v}>
          <button onClick={() => setValue("filter", v)}
                  type="submit">{v}</button>
        </li>)}
      </ul>
    </div>
  </form>;
};

export default SearchSelect;
