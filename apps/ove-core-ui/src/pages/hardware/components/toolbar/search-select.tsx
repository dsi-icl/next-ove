import { Combobox } from "@ove/ui-base-components";
import React, { type RefObject, useMemo } from "react";
import type { FilterValue } from "../columns";

export type SearchSelectProps = {
  values: string[];
  setFilter: (filter: string[] | null) => void;
  ref: RefObject<HTMLElement | null>;
} & Omit<FilterValue, "selected">;

const SearchSelect = ({
  values,
  setFilter,
  filter,
  filterType,
  ref,
}: SearchSelectProps) => {
  const filterLabel = useMemo(
    () => (filterType === "id" ? "ID" : "tag"),
    [filterType],
  );

  return (
    <Combobox
      value={filter ?? []}
      setValue={(value) => setFilter(value.length === 0 ? null : value)}
      options={values.map((v) => ({ value: v, label: v }))}
      label={filterLabel}
      ref={ref}
    />
  );
};

export default SearchSelect;
