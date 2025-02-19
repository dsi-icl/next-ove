import { useMemo } from "react";
import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";

export const usePublications = (projectPublications: string[]) => {
  const getPublications = api.projects.getPublications.useQuery();

  return useMemo(() => {
    if (getPublications.status !== "success" || isError(getPublications.data)) return projectPublications;
    return [...projectPublications, ...getPublications.data].filter((x, i, arr) => arr.indexOf(x) === i);
  }, [getPublications.status, getPublications.data, projectPublications]);
};