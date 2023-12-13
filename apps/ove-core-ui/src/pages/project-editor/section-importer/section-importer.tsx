import { useState } from "react";
import { type Actions } from "../hooks";
import { type Section } from "@prisma/client";

import styles from "./section-importer.module.scss";

type SectionImporterProps = {
  states: string[]
  formatState: (state: string) => string
  getSections: (state: string) => Section[]
  colors: { [dataType: string]: string }
  addToState: (id: string, state: string) => void
  setAction: (action: Actions | null) => void
  selectedState: string
}

const SectionImporter = ({
  states,
  formatState,
  getSections,
  colors,
  addToState,
  setAction,
  selectedState
}: SectionImporterProps) => {
  const [selected, setSelected] = useState(states[0]);
  return <section id={styles["import"]}>
    <h2>Import Section</h2>
    <div className={styles.container}>
      <ul id={styles["states"]}>
        {states.map(state => <li
          key={state}>
          <button
            onClick={() => setSelected(state)}>{formatState(state)}</button>
        </li>)}
      </ul>
      <ul id={styles["sections"]}>
        {getSections(selected).map(section => <li key={section.id}
                                                  style={{ backgroundColor: colors[section.dataType.toUpperCase()] }}>
          <button
            onClick={() => {
              setAction(null);
              addToState(section.id, selectedState);
            }}>{section.asset.length < 25 ? section.asset : `${section.asset.slice(0, 24)}...`}</button>
        </li>)}
      </ul>
    </div>
  </section>;
};

export default SectionImporter;
