import React, { memo, useEffect, useState } from "react";
import {
  cn,
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
import { useBrowser, useBrowserConfig, useLiveFeed } from "./hooks";

export type ScreenProps = {
  bridgeId: string;
  colId: number;
  rowId: number;
  bounds: Bounds;
  setSelected: (display: Bounds["displays"][0]) => boolean;
  selected: [string, string] | null;
};

const Screen = memo(
  ({ colId, bounds, rowId, bridgeId, setSelected, selected }: ScreenProps) => {
    const [highlighted, setHighlighted] = useState(false);
    const display = assert(
      bounds.displays.find(
        ({ row, column }) => column === colId + 1 && row === rowId + 1,
      ),
    );
    const browserConfig = useBrowserConfig(
      bridgeId,
      display.deviceId,
      display.displayId,
    );
    const browser = useBrowser(bridgeId, display.deviceId, display.displayId);
    const screenshot = useLiveFeed(
      bridgeId,
      display.deviceId,
      display.displayId,
    );
    const aspectRatio = [
      bounds.width / bounds.columns,
      bounds.height / bounds.rows,
    ];

    useEffect(() => {
      setHighlighted(selected !== null && selected[0] === display.rendererId && selected[1] === display.deviceId);
    }, [selected, display.rendererId, display.deviceId]);

    return (
      <li
        key={colId}
        className={cn(
          "flex w-full items-center justify-center border border-solid bg-[#002147] text-white",
          highlighted ? "border-destructive" : "border-white",
        )}
        style={{
          aspectRatio: `${aspectRatio[0]}/${aspectRatio[1]}`,
        }}
      >
        <HoverCard>
          <HoverCardTrigger className="size-full">
            <button
              className="size-full"
              onClick={() => {
                const selected = setSelected(display);
                setHighlighted(selected);
              }}
            >
              {screenshot === null || screenshot === "loading" ? (
                <div className="size-full" />
              ) : (
                <img
                  className="size-full"
                  src={
                    screenshot.startsWith("data:image")
                      ? screenshot
                      : `data:image/png;base64,${screenshot}`
                  }
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
                  <TableCell>renderer id</TableCell>
                  <TableCell>{display.rendererId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>device id</TableCell>
                  <TableCell>{display.deviceId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>display id</TableCell>
                  <TableCell>{display.displayId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>default url</TableCell>
                  <TableCell className="text-wrap break-all">
                    {browserConfig}
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
