import React, { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { type ServiceType, StatusOptions } from "@ove/ove-types";
import { Display, HddNetwork, Projector } from "react-bootstrap-icons";

import styles from "../observatory/observatory.module.scss";

export type HardwareRow = {
  protocol: string
  id: string
  hostname: string
  mac: string
  tags: string[]
  status: StatusOptions
  actions: ReactNode
}

type FilterValue = {
  filterType: "tags" | "id"
  filter: string | null
  selected: string[] | null
}

const ProtocolIcon = ({ protocol }: { protocol: ServiceType }) => {
  switch (protocol) {
    case "node":
      return <HddNetwork className={styles["protocol-icon"]} />;
    case "mdc":
      return <Display className={styles["protocol-icon"]} />;
    case "pjlink":
      return <Projector className={styles["protocol-icon"]} />;
  }
};

export const columns: ColumnDef<HardwareRow>[] = [
  {
    accessorKey: "protocol",
    header: ({ column }) => <button
      style={{ display: "flex", width: "100%", justifyContent: "center" }}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Protocol
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </button>,
    cell: ({ row }) => <div
      style={{ display: "flex", justifyContent: "center" }}>
      <ProtocolIcon protocol={row.getValue("protocol")} />
    </div>
  },
  {
    accessorKey: "id",
    header: ({ column }) => <button
      style={{ display: "flex", width: "100%", justifyContent: "center" }}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      ID
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </button>,
    filterFn: (row, columnId, filterValue) => {
      const { filterType, filter, selected } = filterValue as FilterValue;
      const v = row.getValue(columnId) as string;
      if (selected === null) {
        if (filterType === "tags" || filter === null) return true;
        return filter === v;
      } else {
        if (filterType === "tags" || filter === null) {
          return selected.includes(v);
        }
        return selected.includes(v) && v.startsWith(filter);
      }
    }
  },
  {
    accessorKey: "hostname",
    header: ({ column }) => <button
      style={{ display: "flex", width: "100%", justifyContent: "center" }}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Hostname
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </button>
  },
  {
    accessorKey: "mac",
    header: ({ column }) => <button
      style={{ display: "flex", width: "100%", justifyContent: "center" }}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      MAC
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </button>
  },
  {
    accessorKey: "tags",
    header: ({ column }) => <button
      style={{ display: "flex", width: "100%", justifyContent: "center" }}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Tags
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </button>,
    filterFn: (row, columnId, filterValue) => {
      const { filterType, filter } = filterValue as FilterValue;
      const v = row.getValue(columnId) as string[];
      if (filterType === "id" || filter === null) return true;
      return v.find(tag => tag.startsWith(filter)) !== undefined;
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => <button
      style={{ display: "flex", width: "100%", justifyContent: "center" }}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Status
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </button>
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => row.getValue("actions")
  }
];
