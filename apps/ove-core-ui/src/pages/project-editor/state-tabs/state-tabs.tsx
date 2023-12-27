import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { X } from "react-bootstrap-icons";

import styles from "./state-tabs.module.scss";

type StateTabsProps = {
  selected: string
  states: string[]
  currentState: string
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
  addState,
  currentState
}: StateTabsProps) => {
  const { register, handleSubmit, resetField } = useForm<{ name: string }>();
  const [isEdit, setIsEdit] = useState(false);

  const onSubmit = ({ name }: { name: string }) => {
    if (states.includes(name) || name === "") return;
    setIsEdit(false);
    updateState(selected, name);
  };

  useEffect(() => {
    resetField("name");
  }, [selected]);

  return <nav className={styles.container}>
    <ul className={styles.tabs}>
      {states.map(state => {
        const formatted = formatState(state);
        const width = isEdit ?
          "100%" :
          (state === "__default__" ?
            `max(${formatted.length / 2}rem, 3rem)` :
            `${formatted.length / 2}rem + 1rem`);
        return <li key={state} style={{width: `calc(${width} + 2rem)`}}
                   className={[styles.tab, selected === state ? ` ${styles.selected}` : ""].join(" ")}>
          <button style={{ fontWeight: selected === state ? 700 : 400 }}
                  className={styles.editable}
                  onClick={isEdit && selected === state ? undefined : () => {
                    if (state === currentState) return;
                    setState(state);
                  }}
                  onBlur={e => {
                    if (e.relatedTarget !== null) return;
                    setIsEdit(false);
                  }}
                  onDoubleClick={state === "__default__" ? undefined : () => setIsEdit(true)}>
            {isEdit && selected === state ?
              <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("name")} />
                <input type="submit" style={{ display: "none" }} />
              </form> : <p
                style={{ marginRight: state === "__default__" || isEdit ? 0 : "1.5rem", width, whiteSpace: "nowrap" }}>{formatted}</p>}</button>
          {state === "__default__" || isEdit ? null :
            <button className={styles.remove}
                    onClick={() => removeState(state)}><X /></button>}
        </li>;
      })}
      <li className={styles.tab} id={styles["add"]}>
        <button onClick={addState}>+</button>
      </li>
    </ul>
  </nav>;
};

export default StateTabs;
