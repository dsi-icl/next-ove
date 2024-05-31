import type { Actions } from "../hooks";
import { Import, X } from "lucide-react";
import { dataTypes } from "@ove/ove-types";
import { Json, assert } from "@ove/ove-utils";
import type { Section } from "@prisma/client";
import React, { useRef, useState } from "react";
import { PlusCircle } from "react-bootstrap-icons";
import ResizeContainer from "../canvas/resize-container";
import { ReorderableItem, ReorderableList } from "@ove/ui-reorderable-list";

import styles from "./sections.module.scss";

type SectionsProps = {
  sections: Section[]
  select: (id: string | null) => void
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
  selected,
  setAction,
  numStates,
  state,
  removeFromState,
  generateSection,
  setSections
}: SectionsProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [characterLimit, setCharacterLimit] = useState(0);

  const getCharacterLimit = (bounds: { width: number } | undefined) => {
    if (listRef.current === null || bounds === undefined) return;
    const rem = parseFloat(getComputedStyle(document.body)
      .fontSize.replace("px", ""));
    setCharacterLimit(Math.floor((bounds.width - (4 * rem)) / (rem * 0.5)));
  };

  const setSectionsHandler = (curList: Section[], newList: Section[]) => {
    const newListOldOrder = Json.copy(newList)
      .sort((a, b) => a.ordering - b.ordering);
    let startOrder: number | null = null;
    let endOrder: number | null = null;
    newList.forEach((section, i) => {
      const oldOrder = newListOldOrder[i].ordering;
      if (oldOrder !== section.ordering) {
        if (endOrder === null && startOrder === null) {
          endOrder = section.ordering;
          startOrder = oldOrder;
        }
      }
    });

    if (startOrder === null || endOrder === null) {
      throw new Error("Illegal null");
    }

    return curList
      .slice(0, assert(startOrder))
      .concat([curList[assert(endOrder)]]
        .concat(curList.slice(assert(startOrder), assert(endOrder)))
        .map((section, i) => ({
          ...section,
          ordering: i + assert(startOrder)
        })))
      .concat(curList.slice(assert(endOrder) + 1));
  };

  return <section id={styles["sections"]}>
    <h2>Sections</h2>
    <ul>
      <ResizeContainer container={{
        ref: listRef,
        width: "100%",
        height: "100%",
        update: getCharacterLimit
      }} useContentRect={true}>
        <ReorderableList
          onListUpdate={newList =>
            setSections(curList =>
              setSectionsHandler(curList, newList as Section[]))}
          list={sections} style={{}}>
          {sections.map(section => {
            const fontWeight = selected === section.id ? 700 : 400;
            const asset = section.asset.length <= characterLimit ?
              section.asset : `${section.asset.slice(0, characterLimit)}...`;
            const backgroundColor = assert(dataTypes
              .find(({ name }) => name === section.dataType.toLowerCase()))
              .color;
            return (
              <ReorderableItem key={section.id}>
                <li key={section.id} style={{
                  backgroundColor,
                  borderWidth: selected === section.id ? "2px" : "1px"
                }}>
                  <button className={styles.container} style={{ flexGrow: 1 }}
                          onClick={() => select(section.id)}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: "1.25rem"
                    }}>{section.ordering}</span>
                    <span className={styles.asset}
                          style={{ fontWeight }}>{asset}</span>
                  </button>
                  <div className={styles["clear-container"]}>
                    <button onClick={() => removeFromState(section.id, state)}>
                      <X
                        width="1rem" height="1rem"
                        strokeWidth={selected === section.id ? "4px" : "2px"} />
                    </button>
                  </div>
                </li>
              </ReorderableItem>
            );
          })}
        </ReorderableList>
      </ResizeContainer>
    </ul>
    <div className={styles.new}>
      {numStates > 1 ?
        <button title="Import" onClick={() => setAction("import-section")}>
          <Import strokeWidth="1px" /></button> : null}
      <button title="Add" onClick={() => generateSection(state)}><PlusCircle />
      </button>
    </div>
  </section>;
};

export default Sections;
