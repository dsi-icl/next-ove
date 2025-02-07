import { useMemo } from "react";
import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";

export const useTags = (projectTags: string[]) => {
  const getTags = api.projects.getTags.useQuery();

  return useMemo(() => {
    if (getTags.status !== "success" || isError(getTags.data)) return projectTags;
    return [...projectTags, ...getTags.data].filter((x, i, arr) => arr.indexOf(x) === i);
  }, [getTags.status, getTags.data, projectTags]);
};