import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";

import styles from "./data-table.module.scss";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filter: string | null
  filterType: "id" | "tags"
  selected: string[] | null
}

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

const DataTable = <TData, TValue>({
  columns,
  data,
  filter,
  filterType,
  selected
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
  });

  useEffect(() => {
    console.log(filter, filterType, selected);
    table.getColumn(filterType)?.setFilterValue({
      filterType,
      filter,
      selected
    });

    return () => {
      table.getColumn(filterType)?.setFilterValue({
        filterType,
        filter: null,
        selected: null
      });
    };
  }, [filter, filterType, table, selected]);

  return <div>
    <table className={styles.table}>
      <thead>
        {table.getHeaderGroups().map(group => <tr key={group.id}>
          {group.headers.map(header => <th key={header.id}
                                           style={{
                                             width: getSize(header.id),
                                             maxWidth: getSize(header.id),
                                             minWidth: getSize(header.id)
                                           }}>
            {header.isPlaceholder ? null :
              flexRender(header.column.columnDef.header, header.getContext())}
          </th>)}
        </tr>)}
      </thead>
      <tbody>
        {table.getRowModel()?.rows?.length > 0 ? table.getRowModel().rows.map(row =>
          <tr key={row.id} data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map(cell => <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>)}
          </tr>) : <tr>
          <td colSpan={columns.length}>
            No results.
          </td>
        </tr>}
      </tbody>
    </table>
    <div className="flex items-center justify-end space-x-2 py-4">
      <button onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>Previous
      </button>
      <button onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>Next
      </button>
    </div>
  </div>;
};

export default DataTable;
