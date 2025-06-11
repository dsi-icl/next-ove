import { logs } from "../../../utils/api";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import { env } from "../../../env";
import { useState } from "react";

export const usePages = (
  dates:
    | {
        start: Date | null;
        end: Date | null;
      }[]
    | undefined,
  appIds: string[] | undefined,
  levels: string[] | undefined,
  keywords: string[] | undefined,
) => {
  const [pageIndex, setPageIndex] = useState(0);
  const getPages = logs.getPages.useQuery(
    {
      url: assert(env.LOGGING?.SERVER?.API_ENDPOINT),
      dates,
      appIds,
      levels,
      keywords,
    },
  );

  return {
    pageCount:
      getPages.status === "success" && !isError(getPages.data)
        ? getPages.data.pageCount
        : 0,
    pageIndex,
    pageSize:
      getPages.status === "success" && !isError(getPages.data)
        ? getPages.data.pageSize
        : env.PAGE_SIZE,
    setPageIndex,
  };
};
