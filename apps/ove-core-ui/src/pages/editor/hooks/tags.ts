import { useMemo } from "react";
import { api } from "../../../utils/api";

export const useTags = (projectTags: string[]) => {
  const getTags = api.projects.getTags.useQuery();

  return useMemo(() => {
    if (getTags.status !== "success") return projectTags;
    return [...projectTags, ...getTags.data].filter((x, i, arr) => arr.indexOf(x) === i);
  }, [getTags.status, getTags.data, projectTags]);
};