import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import styles from "./state-tabs.module.scss";

type StateTabsProps = {
  selected: string
  states: string[]
  setState: (state: string) => void
  removeState: (state: string) => void
}

const StateTabs = ({
  selected,
  removeState,
  states,
  setState
}: StateTabsProps) => {
  const { register, handleSubmit, resetField } = useForm<{ name: string }>();
  const [isEdit, setIsEdit] = useState(false);
  const [customStates, setCustomStates] = useState(["__default__"]);

  const getStates = () => states.concat(customStates).filter((x, i, arr) => arr.indexOf(x) === i);
  const formatStates = (state: string) => state === "__default__" ? "*" : (state.startsWith("__new__") ? `New (${state.slice(7)})` : state);

  const onSubmit = ({ name }: { name: string }) => {
    if (getStates().includes(name)) return;
    setIsEdit(false);
    if (name === "") {
      setCustomStates(cur => cur.filter(c => c !== selected));
      removeState(selected);
      setState("__default__");
    } else {
      setCustomStates(cur => cur.map(c => c === selected ? name : c));
    }
  };

  useEffect(() => {
    resetField("name");
  }, [selected]);

  return <nav className={styles.container}>
    <ul className={styles.tabs}>
      {getStates().map(state => <li key={state} className={styles.tab}
                                    onDoubleClick={state === "__default__" ? undefined : () => setIsEdit(true)}>
        {isEdit && selected === state ?
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register("name")} />
            <button type="submit" style={{ display: "none" }} />
          </form> :
          <button style={{ fontWeight: selected === state ? 700 : 400 }}
                  onClick={() => setState(state)}>{formatStates(state)}</button>}
      </li>)}
      <li className={styles.tab} id={styles["add"]}>
        <button
          onClick={() => setCustomStates(cur => [...cur, `__new__${cur.length}`])}>+
        </button>
      </li>
    </ul>
  </nav>;
};

export default StateTabs;
