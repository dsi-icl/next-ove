import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";

export const useUser = () => {
  const user = api.getUserID.useQuery({});

  return user.status === "success" && !isError(user.data) ? user.data : null;
};
