import { logs } from "../../../utils/api";
import { assert } from "@ove/ove-utils";
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
  identifiers: string[] | undefined,
  levels: string[] | undefined,
  keywords: string[] | undefined,
) => {
  const [pageIndex, setPageIndex] = useState(0);
  const getPages = logs.getPages.useQuery({
    url: assert(env.LOGGING?.SERVER?.API_ENDPOINT),
    dates,
    appIds,
    identifiers,
    levels,
    keywords,
  });

  return {
    pageCount: getPages.status === "success" ? getPages.data.pageCount : 0,
    pageIndex,
    pageSize:
      getPages.status === "success" ? getPages.data.pageSize : env.PAGE_SIZE,
    setPageIndex,
  };
};
