import { useAuth } from "./auth";
import { custom } from "../../../utils/api";
import { env } from "../../../env";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";

export const useHistoricalLogs = (
  page: number,
  sorting: { [id: string]: "asc" | "desc" }[] | undefined,
  dates: { start: Date | null; end: Date | null }[] | undefined,
  appIds: string[] | undefined,
  levels: string[] | undefined,
  keywords: string[] | undefined,
) => {
  const token = useAuth();
  const getLogs = custom.getLogs.useQuery(
    {
      url: assert(env.LOGGING?.SERVER?.API_ENDPOINT),
      page,
      token: token ?? "",
      sorting,
      dates,
      appIds,
      levels,
      keywords,
    },
    { enabled: token !== null },
  );

  return getLogs.status === "success" && !isError(getLogs.data)
    ? getLogs.data
    : [];
};
