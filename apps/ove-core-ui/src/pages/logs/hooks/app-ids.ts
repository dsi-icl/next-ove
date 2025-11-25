import { useState } from "react";
import { logs } from "../../../utils/api";
import { assert } from "@ove/ove-utils";
import { env } from "../../../env";

export const useAppIds = () => {
  const [appIds, setAppIds] = useState<string[]>([]);
  const getAppIds = logs.getAppIds.useQuery({
    url: assert(env.LOGGING?.SERVER?.API_ENDPOINT),
  });

  return {
    allIds: getAppIds.status === "success" ? getAppIds.data : [],
    appIds,
    setAppIds,
  };
};
