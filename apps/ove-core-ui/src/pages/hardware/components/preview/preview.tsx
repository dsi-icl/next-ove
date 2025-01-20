import React, { memo } from "react";
import Screen, { type ScreenProps } from "./screen";

type PreviewProps = Omit<ScreenProps, "colId" | "rowId">

const Preview = memo(({ bounds, bridgeId, setSelected }: PreviewProps) =>
  <section className="mb-2">
    <ul>
      {Array.from({ length: bounds.rows }).map((_, rowId) =>
        <ul key={rowId} className="max-w-full flex">
          {Array.from({ length: bounds.columns }).map((_, colId) => <Screen
            bridgeId={bridgeId} key={colId} setSelected={setSelected}
            colId={colId} rowId={rowId} bounds={bounds} />)}
        </ul>)}
    </ul>
  </section>);

export default Preview;
