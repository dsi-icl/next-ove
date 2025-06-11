import { type Column, ColumnDef } from "@tanstack/react-table";
import { Log } from "../hooks/log-store";
import React, { useCallback } from "react";
import { ArrowUpDown } from "lucide-react";

const ToggleSort = ({
  column,
  name,
}: {
  column: Column<Log>;
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

export const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "appId",
    header: ({ column }) => <ToggleSort column={column} name="App ID" />,
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId) as string;
      const filter = filterValue as string[] | undefined;

      return filter?.includes(value) ?? true;
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => <ToggleSort column={column} name="Level" />,
    cell: ({ row }) => row.getValue("level"),
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId) as string;
      const filter = filterValue as string[] | undefined;

      return filter?.includes(value) ?? true;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => <ToggleSort column={column} name="Date" />,
    filterFn: (row, columnId, filterValue) => {
      const value = new Date(Date.parse(row.getValue(columnId) as string));
      const filter = filterValue as
        | { start: Date | null; end: Date | null }[]
        | undefined;

      return (
        filter?.some(({ start, end }) => {
          if (start !== null && start > value) return false;
          return end === null || end >= value;
        }) ?? true
      );
    },
  },
  {
    accessorKey: "message",
    header: () => "Message",
    filterFn: (row, columnId, filterValue) => {
      let value = row.getValue(columnId) as string;
      const filter = filterValue as string[] | undefined;
      value = value.replaceAll("\n", " ");
      value = value.replaceAll(/ +/g, " ");

      return filter?.some((f) => value.includes(f)) ?? true;
    },
  },
];

export const getSize = (id: string) => {
  switch (id) {
    case "appId":
      return "10%";
    case "level":
      return "10%";
    case "date":
      return "10%";
    default:
      return "70%";
  }
};
