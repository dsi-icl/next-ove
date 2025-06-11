import DataTable from "../../../components/data-table/data-table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import type { FilterValue } from "./columns";

const getSize = (id: string) => {
  switch (id) {
    case "protocol":
      return "5%";
    case "id":
      return "18%";
    case "hostname":
      return "18%";
    case "mac":
      return "18%";
    case "tags":
      return "36%";
    case "status":
      return "5%";
    case "actions":
      return "18%";
    default:
      return "100%";
  }
};

type ContainerProps<TData extends { id: string }> = {
  data: TData[];
  columns: {
    [K in keyof TData]: ColumnDef<TData, TData[K]>;
  }[keyof TData][];
} & FilterValue;

const Container = <TData extends { id: string }>(
  props: ContainerProps<TData>,
) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (c) => setColumnFilters(c),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => {
    table.getColumn(props.filterType)?.setFilterValue({
      ...props,
    });

    return () => {
      table.getColumn(props.filterType)?.setFilterValue({
        filterType: props.filterType,
        filter: null,
        selected: null,
      });
    };
  }, [table, props.filter, props.filterType, props.selected]);
  return <DataTable {...props} getSize={getSize} table={table} />;
};

export default Container;
