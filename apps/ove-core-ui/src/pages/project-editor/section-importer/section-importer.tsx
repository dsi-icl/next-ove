import React, { useState } from "react";
import type { Actions } from "../hooks";
import { actionColors } from "../utils";
import { X } from "react-bootstrap-icons";
import { Json, assert } from "@ove/ove-utils";
import type { Section } from "@prisma/client";
import type { DataType } from "@ove/ove-types";

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
            const backgroundColor = actionColors[i % actionColors.length];
            return <li key={state}
                       style={{ backgroundColor }}>
              <button
                onClick={() => setSelected(state)}
                style={{ fontWeight: state === selected ? 700 : 400 }}>
                {formatState(state)}
              </button>
            </li>;
          })}
        </ul>
      </div>
      <div id={styles["sections"]}>
        <h4>Select Section</h4>
        <ul>
          {sections.map(section => {
            const backgroundColor = assert(colors.find(({ name }) =>
              name === section.dataType.toLowerCase())).color;
            const asset = section.asset.length < 25 ?
              section.asset : `${section.asset.slice(0, 24)}...`;
            return <li
              key={section.id}
              style={{ backgroundColor }}>
              <button
                onClick={() => {
                  setAction(null);
                  addToState(section.id, selectedState);
                }}>
                <span>{section.ordering}</span>
                {asset}
              </button>
            </li>;
          })}
        </ul>
      </div>
    </div>
  </section>;
};

export default SectionImporter;
