import { type Actions } from "../hooks";
import { Import, X } from "lucide-react";
import { type Section } from "@prisma/client";
import { PlusCircle } from "react-bootstrap-icons";
import { ReorderableItem, ReorderableList } from "@ove/ui-reorderable-list";

import styles from "./sections.module.scss";

type SectionsProps = {
  sections: Section[]
  select: (id: string | null) => void
  colors: { [dataType: string]: string }
  selected: string | null
  setAction: (action: Actions | null) => void
  numStates: number
  state: string
  removeFromState: (id: string, state: string) => void
  generateSection: (state: string) => void
  setSections: (handler: (sections: Section[]) => Section[]) => void
}

const Sections = ({
  sections,
  select,
  colors,
  selected,
  setAction,
  numStates,
  state,
  removeFromState,
  generateSection,
  setSections
}: SectionsProps) => {
  return <section id={styles["sections"]}>
    <h2>Sections</h2>
    <ReorderableList
      onListUpdate={newList => setSections(() => (newList as Section[]).map((section, i) => ({
        ...section,
        ordering: i
      })))} list={sections} style={{ width: "300px" }}>
      {sections.map(section => (
        <ReorderableItem key={section.id}>
          <li key={section.id} style={{
            backgroundColor: colors[section.dataType.toUpperCase()],
            borderWidth: selected === section.id ? "2px" : "1px"
          }}>
            <button className={styles.container} style={{ flexGrow: 1 }}
                    onClick={() => select(section.id)}>
              <span style={{ fontWeight: 700 }}>{section.ordering}</span>
              <span className={styles.asset}
                    style={{ fontWeight: selected === section.id ? 700 : 400 }}>{section.asset.length < 25 ? section.asset : `${section.asset.slice(0, 24)}...`}</span>
            </button>
            <div className={styles["clear-container"]}>
              <button onClick={() => removeFromState(section.id, state)}><X
                style={{
                  border: `${selected === section.id ? "2px" : "1px"} solid black`,
                  borderRadius: "50%"
                }} width="1rem" height="1rem"
                strokeWidth={selected === section.id ? "4px" : "2px"} />
              </button>
            </div>
          </li>
        </ReorderableItem>
      ))}
    </ReorderableList>
    <div className={styles.new}>
      {numStates > 1 ?
        <button title="Import" onClick={() => setAction("import-section")}>
          <Import strokeWidth="1px" /></button> : <></>}
      <button title="Add" onClick={() => generateSection(state)}><PlusCircle />
      </button>
    </div>
  </section>;
};

export default Sections;
