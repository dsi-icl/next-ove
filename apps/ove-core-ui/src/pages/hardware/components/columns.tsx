import type { ServiceType } from "@ove/ove-types";
import React, { type ReactNode, useCallback } from "react";
import type { Column, ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, HardDrive, Monitor, Projector } from "lucide-react";

export type FilterType = "id" | "tags";

export type HardwareRow = {
  protocol: string;
  id: string;
  hostname: string;
  mac: string;
  tags: string[];
  status: ReactNode;
  actions: ReactNode;
};

export type FilterValue = {
  filterType: FilterType;
  filter: string[] | null;
  selected: string[] | null;
};

const ProtocolIcon = ({ protocol }: { protocol: ServiceType }) => {
  switch (protocol) {
    case "node":
      return <HardDrive className="size-4" />;
    case "mdc":
      return <Monitor className="size-4" />;
    case "pjlink":
      return <Projector className="size-4" />;
  }
};

const filterById = (
  row: Row<HardwareRow>,
  columnId: string,
  { filterType, filter, selected }: FilterValue,
) => {
  const v = row.getValue(columnId) as string;
  if (selected === null) {
    if (filterType === "tags" || filter === null) return true;
    return filter.find((f) => v.startsWith(f)) !== undefined;
  } else {
    if (filterType === "tags") return true;
    return selected.includes(v) && (filter === null || filter.find((f) => v.startsWith(f)) !== undefined);
  }
};

const filterByTags = (
  row: Row<HardwareRow>,
  columnId: string,
  { filterType, filter, selected }: FilterValue,
) => {
  const v = row.getValue(columnId) as string[];
  if (filterType === "id") return true;
  return (
    (filter === null || v.some((tag) => filter.find((f) => tag.startsWith(f)) !== undefined)) &&
    (selected === null || v.some((tag) => selected.includes(tag)))
  );
};

const ToggleSort = ({
  column,
  name,
}: {
  column: Column<HardwareRow>;
  name: string;
}) => {
  const toggle = useCallback(() => {
    column.toggleSorting(column.getIsSorted() === "asc");
  }, [column]);
  return (
    <button className="flex w-full justify-center" onClick={toggle}>
      {name}
      <ArrowUpDown className="ml-2 size-4" />
    </button>
  );
};

export const columns: ColumnDef<HardwareRow>[] = [
  {
    accessorKey: "protocol",
    header: ({ column }) => <ToggleSort column={column} name="Protocol" />,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ProtocolIcon protocol={row.getValue("protocol")} />
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: ({ column }) => <ToggleSort column={column} name="ID" />,
    filterFn: filterById,
  },
  {
    accessorKey: "hostname",
    header: ({ column }) => <ToggleSort column={column} name={"Hostname"} />,
  },
  {
    accessorKey: "mac",
    header: ({ column }) => <ToggleSort column={column} name="MAC" />,
  },
  {
    accessorKey: "tags",
    header: ({ column }) => <ToggleSort column={column} name="Tags" />,
    filterFn: filterByTags,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <ToggleSort column={column} name="Status" />,
    cell: ({ row }) => row.getValue("status"),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => row.getValue("actions"),
  },
];
