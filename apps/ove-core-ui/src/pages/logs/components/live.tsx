import DataTable from "../../../components/data-table/data-table";
import { columns, getSize } from "./columns";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useLogStore } from "../hooks/log-store";
import { useMemo, useState } from "react";

type LiveProps = {
  appIds: string[] | undefined;
  levels: string[] | undefined;
  keywords: string[] | undefined;
  dates: { start: Date | null; end: Date | null }[] | undefined;
};

const Live = ({ appIds, levels, keywords, dates }: LiveProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnFilters = useMemo(
    () =>
      [
        {
          id: "appId",
          value: appIds,
        },
        {
          id: "level",
          value: levels,
        },
        {
          id: "date",
          value: dates,
        },
        {
          id: "message",
          value: keywords,
        },
      ] as ColumnFiltersState,
    [appIds, levels, dates, keywords],
  );
  const logs = useLogStore((store) => store.logs);
  const table = useReactTable({
    data: logs,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });
  return <DataTable table={table} columns={columns} getSize={getSize} />;
};

export default Live;
