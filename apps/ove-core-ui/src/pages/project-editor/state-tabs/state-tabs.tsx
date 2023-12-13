import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import styles from "./state-tabs.module.scss";

type StateTabsProps = {
  selected: string
  states: string[]
  setState: (state: string) => void
  removeState: (state: string) => void
  formatState: (state: string) => string
  updateState: (state: string, name: string) => void
  addState: () => void
}

const StateTabs = ({
  selected,
  removeState,
  states,
  setState,
  formatState,
  updateState,
  addState
}: StateTabsProps) => {
  const { register, handleSubmit, resetField } = useForm<{ name: string }>();
  const [isEdit, setIsEdit] = useState(false);

  const onSubmit = ({ name }: { name: string }) => {
    if (states.includes(name)) return;
    setIsEdit(false);
    if (name === "") {
      removeState(selected);
    } else {
      updateState(selected, name);
    }
  };

  useEffect(() => {
    resetField("name");
  }, [selected]);

  return <nav className={styles.container}>
    <ul className={styles.tabs}>
      {states.map(state => <li key={state} className={styles.tab}
                                    onDoubleClick={state === "__default__" ? undefined : () => setIsEdit(true)}>
        {isEdit && selected === state ?
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register("name")} />
            <button type="submit" style={{ display: "none" }} />
          </form> :
          <button style={{ fontWeight: selected === state ? 700 : 400 }}
                  onClick={() => setState(state)}>{formatState(state)}</button>}
      </li>)}
      <li className={styles.tab} id={styles["add"]}>
        <button
          onClick={addState}>+
        </button>
      </li>
    </ul>
  </nav>;
};

export default StateTabs;
