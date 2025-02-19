import { useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";

export const useSorting = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const dbSorting = useMemo(
    () =>
      sorting?.reduce(
        (acc, x) => {
          acc.push({ [x.id]: x.desc ? "desc" : "asc" });
          return acc;
        },
        <{ [id: string]: "desc" | "asc" }[]>[],
      ),
    [sorting],
  );

  return { sorting, setSorting, dbSorting };
};
