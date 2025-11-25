import { useMemo } from "react";
import { api } from "../../../utils/api";

export const usePublications = (projectPublications: string[]) => {
  const getPublications = api.projects.getPublications.useQuery();

  return useMemo(() => {
    if (getPublications.status !== "success") return projectPublications;
    return [...projectPublications, ...getPublications.data].filter((x, i, arr) => arr.indexOf(x) === i);
  }, [getPublications.status, getPublications.data, projectPublications]);
};