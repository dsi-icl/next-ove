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
import type { Browser } from "@ove/ove-types";
import { format } from "../../utils";
import TableHeader from "../table-header";
import { api } from "../../../../utils/api";
import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { getPages } from "../../../../utils";

const useBrowser = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[]
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
      tags,
      deviceIds,
    },
    {
      enabled: deviceId === null,
    },
  );
  const browsers: BrowserDetails[] = useMemo(() => {
    if (deviceId !== null) {
      switch (getBrowsers.status) {
        case "success": {
          return [{ deviceId, browsers: getBrowsers.data }];
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
          const data = getBrowsersAll.data.filter(({ response }) => {
            if (response.status === "error") {
              toast.error(`Failed to get browsers on ${deviceId}`);
              return false;
            }
            return true;
          });

          return data
            .map(({ deviceId, response }) => {
              if (response.status !== "success") throw new Error("Impossible");
              return {
                deviceId,
                browsers: response.data,
              };
            });
        }
        case "error":
          toast.error("Unable to get browsers");
          return [];
        default:
          return [];
      }
    }
  }, [getBrowsersAll.status, getBrowsersAll.data, deviceId, getBrowsers.status, getBrowsers.data]);
  return browsers;
};

type BrowserDetails = {
  deviceId: string;
  browsers: Record<string, Browser>;
};

type BrowserInfoProps = {
  deviceId: string | null;
  bridgeId: string;
  tags?: string[];
  deviceIds?: string[];
};

const BrowserInfo = ({ deviceId, bridgeId, tags, deviceIds }: BrowserInfoProps) => {
  const [idx, setIdx] = useState(0);
  const browsers = useBrowser(bridgeId, deviceId, tags, deviceIds);

  return (
    <DialogContent className="flex w-[70%] flex-col">
      <DialogHeader className="">
        <DialogTitle className="text-2xl font-bold">
          Browser Info - {browsers.at(idx)?.deviceId ?? ""}
        </DialogTitle>
        <DialogDescription>Information on current browsers</DialogDescription>
      </DialogHeader>
      <div className="h-[40vh] overflow-y-scroll">
        {browsers.length > 0 && browsers.at(idx) !== undefined
          ? Object.entries(assert(browsers.at(idx)).browsers).map(
              ([browserId, browser]) => (
                <div key={`${assert(browsers.at(idx)).deviceId} - ${browserId}`}>
                  <h4 className="mt-6 font-bold">Browser - {browserId}</h4>
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
              {getPages(idx, browsers.length).map((ix) => (
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
                    setIdx((cur) => Math.min(cur + 1, browsers.length - 1))
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

export default BrowserInfo;
