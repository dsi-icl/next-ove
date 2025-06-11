import React, { memo } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@ove/ui-base-components";
import { assert } from "@ove/ove-utils";
import TableHeader from "../table-header";
import type { Bounds } from "@ove/ove-types";
import { useBrowser, useLiveFeed, useWindowConfig } from "./hooks";

export type ScreenProps = {
  bridgeId: string;
  colId: number;
  rowId: number;
  bounds: Bounds;
  setSelected: (display: Bounds["displays"][0]) => void;
};

const Screen = memo(
  ({ colId, bounds, rowId, bridgeId, setSelected }: ScreenProps) => {
    const display = assert(
      bounds.displays.find(
        ({ row, column }) => column === colId + 1 && row === rowId + 1,
      ),
    );
    const windowConfig = useWindowConfig(
      bridgeId,
      display.renderer.deviceId,
      display.renderer.displayId,
    );
    const browser = useBrowser(
      bridgeId,
      display.renderer.deviceId,
      display.renderer.displayId,
    );
    const screenshot = useLiveFeed(
      bridgeId,
      display.renderer.deviceId,
      display.renderer.displayId,
    );
    const aspectRatio = [
      bounds.width / bounds.columns,
      bounds.height / bounds.rows,
    ];

    return (
      <li
        key={colId}
        className="flex items-center justify-center border border-solid border-white bg-[#002147] text-white"
        style={{
          width: "100%",
          aspectRatio: `${aspectRatio[0]}/${aspectRatio[1]}`,
        }}
      >
        <HoverCard>
          <HoverCardTrigger className="size-full">
            <button
              className="size-full"
              onClick={() => {
                setSelected(display);
              }}
            >
              {screenshot === undefined || screenshot === "loading" ? (
                <div className="size-full" />
              ) : (
                <img
                  className="size-full"
                  src={`data:image/png;base64,${screenshot}`}
                  alt="screenshot"
                />
              )}
            </button>
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
                  <TableCell>
                    {display.renderer.deviceId}, {display.renderer.displayId}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>default url</TableCell>
                  <TableCell className="text-wrap break-all">
                    {windowConfig}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>current url</TableCell>
                  <TableCell className="text-wrap break-all">
                    {browser}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </HoverCardContent>
        </HoverCard>
      </li>
    );
  },
);

export default Screen;
