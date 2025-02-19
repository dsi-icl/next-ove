import React, { type RefObject, useMemo, useRef } from "react";
import Actions from "../actions/actions";
import type { Device } from "@ove/ove-types";
import { Button } from "@ove/ui-base-components";
import type { FilterType } from "../columns";
import SearchSelect, { type SearchSelectProps } from "./search-select";

export type HardwareControlsProps = {
  devices: Device[];
  setFilterType: (type: FilterType) => void;
  selected: string[] | null;
  bridgeId: string;
} & Omit<SearchSelectProps, "values" | "ref">;

const HardwareControls = ({
  filterType,
  filter,
  selected,
  setFilter,
  setFilterType,
  devices,
  bridgeId,
}: HardwareControlsProps) => {
  const searchValues = useMemo(
    () =>
      devices
        .flatMap(({ id, tags }) => (filterType === "id" ? [id] : tags))
        .filter(
          (v, i, arr) =>
            arr.indexOf(v) === i && (selected === null || selected.includes(v)),
        ),
    [devices, filterType, selected],
  );
  const tag = useMemo(
    () => (filterType === "tags" ? (filter ?? undefined) : undefined),
    [filterType, filter],
  );
  const device = useMemo(
    () =>
      filterType === "id"
        ? (devices.find(({ id }) => id === filter) ?? null)
        : null,
    [filterType, filter, devices],
  );
  const containerRef: RefObject<HTMLDivElement | null> = useRef(null);

  return (
    <div className="flex items-center" ref={containerRef}>
      <p>Filter by:</p>
      <div className="ml-1 mr-2 grow">
        <Button
          variant={filterType === "id" ? "default" : "outline"}
          onClick={() => setFilterType("id")}
          className="w-1/2 grow basis-1/2 rounded-r-none"
        >
          ID
        </Button>
        <Button
          variant={filterType === "tags" ? "default" : "outline"}
          onClick={() => setFilterType("tags")}
          className="w-1/2 grow basis-1/2 rounded-l-none"
        >
          Tags
        </Button>
      </div>
      <SearchSelect
        setFilter={setFilter}
        filter={filter}
        filterType={filterType}
        ref={containerRef}
        values={searchValues}
      />
      <Actions
        bridgeId={bridgeId}
        tag={tag}
        device={device ?? null}
        devices={devices}
      />
    </div>
  );
};

export default HardwareControls;
