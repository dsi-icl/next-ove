import { useState } from "react";
import { type Actions } from "../hooks";
import { actionColors } from "../utils";
import { type DataType } from "../types";
import { X } from "react-bootstrap-icons";
import { type Section } from "@prisma/client";

import styles from "./section-importer.module.scss";
import { Json } from "@ove/ove-utils";

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

  const sort = (a: string, b: string) => {
    if (b === "__default__" || a > b) return 1;
    if (a === "__default__" || b > a) return -1;
    return 0;
  };

  return <section id={styles["import"]}>
    <header>
      <h2>Import Section</h2>
      <button onClick={() => setAction(null)}><X size={"1.25rem"} /></button>
    </header>
    <div className={styles.container}>
      <div id={styles["states"]}>
        <h4>From State</h4>
        <ul>
          {Json.copy(states).sort(sort).map((state, i) => {
            return <li key={state}
                       style={{ backgroundColor: actionColors[i % actionColors.length] }}>
              <button
                onClick={() => setSelected(state)}
                style={{ fontWeight: state === selected ? 700 : 400 }}>{formatState(state)}</button>
            </li>;
          })}
        </ul>
      </div>
      <div id={styles["sections"]}>
        <h4>Select Section</h4>
        <ul>
          {sections.map(section => <li
            key={section.id}
            style={{ backgroundColor: colors.find(({name}) => name === section.dataType.toLowerCase())!.color }}>
            <button
              onClick={() => {
                setAction(null);
                addToState(section.id, selectedState);
              }}><span>{section.ordering}</span>{section.asset.length < 25 ? section.asset : `${section.asset.slice(0, 24)}...`}</button>
          </li>)}
        </ul>
      </div>
    </div>
  </section>;
};

export default SectionImporter;
