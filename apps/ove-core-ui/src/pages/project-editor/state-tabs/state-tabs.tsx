import { type Section } from "@prisma/client";

import styles from "./state-tabs.module.scss";

type StateTabsProps = {
  sections: Section[]
  setState: (state: string) => void
}

const StateTabs = ({sections, setState}: StateTabsProps) => {
  const getStates = (sections: Section[]) => sections.flatMap(({states}) => states).filter((x, i, arr) => arr.indexOf(x) === i);
  const formatStates = (state: string) => state === "__default__" ? "*" : state;
  return <nav className={styles.container}>
    <ul className={styles.tabs}>
      {getStates(sections).map(state => <li key={state} className={styles.tab}><button onClick={() => setState(state)}>{formatStates(state)}</button></li>)}
      <li className={styles.tab} id={styles["add"]}><button>+</button></li>
    </ul>
  </nav>;
};

export default StateTabs;
