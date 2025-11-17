import { useState } from "react";
import { logs } from "../../../utils/api";
import { assert } from "@ove/ove-utils";
import { env } from "../../../env";
import { isError } from "@ove/ove-types";

export const useIdentifiers = () => {
  const [identifiers, setIdentifiers] = useState<string[]>([]);
  const getIdentifiers = logs.getIdentifiers.useQuery(
    {
      url: assert(env.LOGGING?.SERVER?.API_ENDPOINT),
    },
  );

  return {
    allIdentifiers:
      getIdentifiers.status === "success" && !isError(getIdentifiers.data)
        ? getIdentifiers.data
        : [],
    identifiers,
    setIdentifiers,
  };
};
