import { useState } from "react";
import { type Actions } from "../hooks";
import { type DataType } from "../types";
import { type Section } from "@prisma/client";

import styles from "./section-importer.module.scss";

type SectionImporterProps = {
  states: string[]
  formatState: (state: string) => string
  getSections: (from: string, to: string) => Section[]
  colors: DataType[]
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
  const sections = getSections(selected, selectedState);
  return <section id={styles["import"]}>
    <h2>Import Section</h2>
    <div className={styles.container}>
      <ul id={styles["states"]}>
        {sections.flatMap(({ states }) => states).filter((x, i, arr) => arr.indexOf(x) === i).map(state =>
          <li key={state}>
            <button
              onClick={() => setSelected(state)}>{formatState(state)}</button>
          </li>)}
      </ul>
      <ul id={styles["sections"]}>
        {sections.map(section => <li
          key={section.id}
          style={{ backgroundColor: colors.find(({name}) => name === section.dataType.toLowerCase())!.color }}>
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
