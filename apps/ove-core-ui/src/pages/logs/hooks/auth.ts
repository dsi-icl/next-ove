import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";

export const useAuth = () => {
  const getLoggingToken = api.getLoggingToken.useQuery();
  return getLoggingToken.status === "success" && !isError(getLoggingToken.data)
    ? getLoggingToken.data
    : null;
};
