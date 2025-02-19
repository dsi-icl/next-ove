import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@ove/ui-base-components";
import React, { useMemo, useState } from "react";
import { type Browser, isError } from "@ove/ove-types";
import { format } from "../utils";
import TableHeader from "./table-header";
import { api } from "../../../utils/api";
import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { getPages } from "../../../utils";

const useBrowser = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined,
) => {
  const getBrowsers = api.hardware.getBrowsers.useQuery(
    {
      bridgeId,
      deviceId: deviceId ?? "",
    },
    {
      enabled: deviceId !== null,
    },
  );
  const getBrowsersAll = api.hardware.getBrowsersAll.useQuery(
    {
      bridgeId,
      tag,
    },
    {
      enabled: deviceId === null,
    },
  );
  const browsers: BrowserDetails[] = useMemo(() => {
    if (deviceId !== null) {
      switch (getBrowsers.status) {
        case "success": {
          if (isError(getBrowsers.data.response)) {
            toast.error("Unable to get browsers");
            return [];
          }

          return [{ deviceId, windows: getBrowsers.data.response }];
        }
        case "error":
          toast.error("Unable to get browsers");
          return [];
        default:
          return [];
      }
    } else {
      switch (getBrowsersAll.status) {
        case "success": {
          if (isError(getBrowsersAll.data.response)) {
            toast.error("Unable to get browsers");
            return [];
          }

          const data = getBrowsersAll.data.response.filter(({ response }) => {
            if (isError(response)) {
              toast.error(`Failed to get browsers on ${deviceId}`);
              return false;
            }
            return true;
          });

          return data.map(({ deviceId, response }) => ({
            deviceId,
            windows: response as Record<string, Browser>,
          }));
        }
        case "error":
          toast.error("Unable to get browsers");
          return [];
        default:
          return [];
      }
    }
  }, [
    getBrowsersAll.status,
    getBrowsersAll.data?.response,
    deviceId,
    getBrowsers.status,
    getBrowsers.data?.response,
  ]);
  return browsers;
};

type BrowserDetails = {
  deviceId: string;
  windows: Record<string, Browser>;
};

type WindowInfoProps = {
  deviceId: string | null;
  bridgeId: string;
  tag?: string;
};

const WindowInfo = ({ deviceId, bridgeId, tag }: WindowInfoProps) => {
  const [idx, setIdx] = useState(0);
  const windows = useBrowser(bridgeId, deviceId, tag);

  return (
    <DialogContent className="flex w-[70%] flex-col">
      <DialogHeader className="">
        <DialogTitle className="text-2xl font-bold">
          Window Info - {windows.at(idx)?.deviceId ?? ""}
        </DialogTitle>
        <DialogDescription>Information on current windows</DialogDescription>
      </DialogHeader>
      <div className="h-[40vh] overflow-y-scroll">
        {windows.length > 0 && windows.at(idx) !== undefined
          ? Object.entries(assert(windows.at(idx)).windows).map(
              ([windowId, browser]) => (
                <div key={`${assert(windows.at(idx)).deviceId} - ${windowId}`}>
                  <h4 className="mt-6 font-bold">Window - {windowId}</h4>
                  <Table>
                    <TableHeader />
                    <TableBody>
                      <TableRow>
                        <TableCell>display id</TableCell>
                        <TableCell>{format(browser?.displayId)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>url</TableCell>
                        <TableCell className="text-wrap break-all">
                          {format(browser?.url)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ),
            )
          : null}
      </div>
      <DialogFooter>
        {deviceId === null ? (
          <Pagination className="mb-6 mt-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setIdx((cur) => Math.max(cur - 1, 0))}
                />
              </PaginationItem>
              {getPages(idx, windows.length).map((ix) => (
                <PaginationItem key={ix}>
                  <PaginationLink
                    isActive={idx === ix}
                    onClick={() => setIdx(ix)}
                  >
                    {ix}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setIdx((cur) => Math.min(cur + 1, windows.length - 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </DialogFooter>
    </DialogContent>
  );
};

export default WindowInfo;
