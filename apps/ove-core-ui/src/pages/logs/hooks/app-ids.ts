import { useState } from "react";
import { custom } from "../../../utils/api";
import { assert } from "@ove/ove-utils";
import { env } from "../../../env";
import { useAuth } from "./auth";
import { isError } from "@ove/ove-types";

export const useAppIds = () => {
  const [appIds, setAppIds] = useState<string[]>([]);
  const token = useAuth();
  const getAppIds = custom.getAppIds.useQuery(
    {
      url: assert(env.LOGGING?.SERVER?.API_ENDPOINT),
      token: token ?? "",
    },
    { enabled: token !== null },
  );

  return {
    allIds:
      getAppIds.status === "success" && !isError(getAppIds.data)
        ? getAppIds.data
        : [],
    appIds,
    setAppIds,
  };
};
