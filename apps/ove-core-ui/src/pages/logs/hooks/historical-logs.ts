import { logs } from "../../../utils/api";
import { env } from "../../../env";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";

export const useHistoricalLogs = (
  page: number,
  sorting: { [id: string]: "asc" | "desc" }[] | undefined,
  dates: { start: Date | null; end: Date | null }[] | undefined,
  appIds: string[] | undefined,
  identifiers: string[] | undefined,
  levels: string[] | undefined,
  keywords: string[] | undefined,
) => {
  const getLogs = logs.getLogs.useQuery(
    {
      url: assert(env.LOGGING?.SERVER?.API_ENDPOINT),
      page,
      sorting,
      dates,
      appIds,
      identifiers,
      levels,
      keywords,
    },
  );

  return getLogs.status === "success" && !isError(getLogs.data)
    ? getLogs.data
    : [];
};
