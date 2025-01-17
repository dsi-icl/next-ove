import React, { useMemo } from "react";
import Actions from "../actions/actions";
import type { Device } from "@ove/ove-types";
import { Button } from "@ove/ui-base-components";
import type { FilterType } from "../data-table/columns";
import SearchSelect, { type SearchSelectProps } from "./search-select";

export type HardwareControlsProps = {
  devices: Device[]
  setFilterType: (type: FilterType) => void
  selected: string[] | null
  bridgeId: string
} & Omit<SearchSelectProps, "values">

const HardwareControls = ({
  filterType,
  filter,
  selected,
  setFilter,
  setFilterType,
  devices,
  bridgeId
}: HardwareControlsProps) => {
  const searchValues = useMemo(() => devices.flatMap(({
    id,
    tags
  }) => filterType === "id" ? [id] : tags).filter((v, i, arr) =>
    arr.indexOf(v) === i && (selected === null ||
      selected.includes(v))), [devices, filterType, selected]);
  const tag = useMemo(() => filterType === "tags" ? (filter ?? undefined) : undefined, [filterType, filter]);
  const device = useMemo(() => filterType === "id" ? devices.find(({ id }) => id === filter) ?? null : null, [filterType, filter, devices]);

  return <div className="flex items-center">
    <p>Filter by:</p>
    <div className="ml-1 mr-2 grow">
      <Button variant={filterType === "id" ? "default" : "outline"}
              onClick={() => setFilterType("id")}
              className="rounded-r-none w-[50%] basis-1/2 grow">ID
      </Button>
      <Button variant={filterType === "tags" ? "default" : "outline"}
              onClick={() => setFilterType("tags")}
              className="rounded-l-none w-[50%] basis-1/2 grow">Tags
      </Button>
    </div>
    <SearchSelect setFilter={setFilter} filter={filter}
                  filterType={filterType}
                  values={searchValues} />
    <Actions bridgeId={bridgeId} tag={tag} device={device ?? null}
             devices={devices} />
  </div>;
};

export default HardwareControls;
