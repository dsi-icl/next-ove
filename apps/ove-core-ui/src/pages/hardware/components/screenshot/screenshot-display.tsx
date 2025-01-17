import {
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext, DialogDescription
} from "@ove/ui-base-components";
import { getPages } from "../../utils";
import { assert } from "@ove/ove-utils";
import React, { useMemo, useState } from "react";
import type { TransferMethod } from "./screenshot-config";

const ScreenshotDisplay = ({ deviceId, screenshots, transferMethod }: {
  deviceId: string | null
  transferMethod: TransferMethod
  screenshots: { deviceId: string, response: string[] }[]
}) => {
  const [idx, setIdx] = useState(0);
  const current = useMemo(() => screenshots.at(idx) ?? {
    deviceId: "",
    response: []
  }, [screenshots, idx]);
  return <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle className="font-bold text-2xl">Screenshots
        - {screenshots.at(idx)?.deviceId ?? ""}</DialogTitle>
      <DialogDescription>{transferMethod === "response" ? "View the screenshots" : "View the location of the screenshots"}</DialogDescription>
    </DialogHeader>
    <div
      className="w-full h-full flex flex-col items-center">
      <ul className="overflow-y-scroll">
        {assert(current.response).map((screenshot, i) =>
          <li className="mt-2 max-w-full" key={screenshot}>
            {transferMethod === "response" ? <img
              src={`data:image/png;base64,${screenshot}`} alt={`Screenshot - ${i}`} /> : screenshot}
          </li>)}
      </ul>
    </div>
    <DialogFooter>
      {deviceId === null ? <Pagination className="mt-auto mb-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setIdx(cur => Math.max(cur - 1, 0))} />
          </PaginationItem>
          {getPages(idx, screenshots.length).map(ix => <PaginationItem key={ix}>
            <PaginationLink isActive={idx === ix}
                            onClick={() => setIdx(ix)}>{ix}</PaginationLink>
          </PaginationItem>)}
          <PaginationItem>
            <PaginationNext
              onClick={() => setIdx(cur => Math.min(cur + 1, screenshots.length - 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination> : null}
    </DialogFooter>
  </DialogContent>;
};

export default ScreenshotDisplay;
