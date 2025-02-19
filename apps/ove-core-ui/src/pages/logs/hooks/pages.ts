import { custom } from "../../../utils/api";
import { useAuth } from "./auth";
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
  const token = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const getPages = custom.getPages.useQuery(
    {
      token: token ?? "",
      url: assert(env.LOGGING?.SERVER?.API_ENDPOINT),
      dates,
      appIds,
      levels,
      keywords,
    },
    { enabled: token !== null },
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
