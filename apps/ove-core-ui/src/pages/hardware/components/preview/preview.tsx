import React from "react";
import { type Bounds } from "@ove/ove-types";
import Screen from "./screen";

const Preview = ({ bounds, bridgeId, setSelected, selected }: {
  bounds: Bounds,
  bridgeId: string
  setSelected: (v: string[] | null) => void
  selected: string[] | null
}) => {
  return <section>
    <ul>
      {Array.from({ length: bounds.rows }).map((_, rowId) =>
        <ul key={rowId}
            style={{
              maxWidth: "100%",
              display: "flex"
            }}>
          {Array.from({ length: bounds.columns }).map((_, colId) => <Screen
            bridgeId={bridgeId} key={colId} setSelected={setSelected}
            colId={colId} rowId={rowId} bounds={bounds} selected={selected} />)}
        </ul>)}
    </ul>
  </section>;
};

export default Preview;
