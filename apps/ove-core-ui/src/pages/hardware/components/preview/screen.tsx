import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@ove/ui-base-components";
import { assert } from "@ove/ove-utils";
import TableHeader from "../table-header";
import type { Bounds } from "@ove/ove-types";
import { useBrowser, useLiveFeed, useWindowConfig } from "./hooks";

export type ScreenProps = {
  bridgeId: string
  colId: number
  rowId: number
  bounds: Bounds
  setSelected: (display: Bounds["displays"][0]) => void
}

const Screen = ({ colId, bounds, rowId, bridgeId, setSelected }: ScreenProps) => {
  const display = assert(bounds.displays.find(({
    row,
    column
  }) => column === colId + 1 && row === rowId + 1));
  const windowConfig = useWindowConfig(bridgeId,
    display.renderer.deviceId, display.renderer.displayId);
  const browser = useBrowser(bridgeId, display.renderer.deviceId,
    display.renderer.displayId);
  const screenshot = useLiveFeed(bridgeId,
    display.renderer.deviceId, display.renderer.displayId);
  const aspectRatio = [bounds.width / bounds.columns,
    bounds.height / bounds.rows];

  return <li key={colId}
             className="border-white border-[1px] border-solid bg-[#002147] text-white flex items-center justify-center"
             style={{
               width: "100%",
               aspectRatio: `${aspectRatio[0]}/${aspectRatio[1]}`
             }}>
    <HoverCard>
      <HoverCardTrigger className="w-full h-full">
        <button className="w-full h-full" onClick={() => {
          setSelected(display);
        }}>{screenshot === undefined || screenshot === "loading" ?
          <div className="w-full h-full" /> :
          <img className="w-full h-full"
               src={`data:image/png;base64,${screenshot}`}
               alt="screenshot" />}</button>
      </HoverCardTrigger>
      <HoverCardContent>
        <h2 className="text-center font-bold">Display Details</h2>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>row</TableCell>
              <TableCell>{display.row}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>column</TableCell>
              <TableCell>{display.column}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>display id</TableCell>
              <TableCell>{display.displayId}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>renderer</TableCell>
              <TableCell>{display.renderer.deviceId}, {display.renderer.displayId}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>default url</TableCell>
              <TableCell
                className="text-wrap break-words break-all">{windowConfig}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>current url</TableCell>
              <TableCell
                className="text-wrap break-words break-all">{browser}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </HoverCardContent>
    </HoverCard>
  </li>;
};

export default Screen;
