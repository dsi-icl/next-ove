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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@ove/ui-base-components";
import { getPages } from "../../utils";
import type { FilterValue } from "./columns";
import React, { useEffect, useState } from "react";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
} & FilterValue

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

  return <>
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(group => <TableRow key={group.id}>
          {group.headers.map(header => <TableHead key={header.id}
                                           style={{
                                             width: getSize(header.id),
                                             maxWidth: getSize(header.id),
                                             minWidth: getSize(header.id)
                                           }} className="bg-[#002147] text-white text-center">
            {header.isPlaceholder ? null :
              flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>)}
        </TableRow>)}
      </TableHeader>
      <TableBody>
        {table.getRowModel()?.rows?.length > 0 ? table.getRowModel().rows.map(row =>
          <TableRow className="even:bg-[#f2f2f2] odd:bg-[#fff] hover:bg-[#ddd]" key={row.id} data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map(cell => <TableCell className="text-center" key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>)}
          </TableRow>) : <TableRow className="even:bg-[#f2f2f2] odd:bg-[#fff] hover:bg-[#ddd]">
          <TableCell className="text-center" colSpan={columns.length}>
            No results.
          </TableCell>
        </TableRow>}
      </TableBody>
    </Table>
    <Pagination className="mt-6 mb-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
        </PaginationItem>
        {getPages(table.getState()?.pagination?.pageIndex ?? 0, table.getPageCount()).map(ix => <PaginationItem key={ix}>
          <PaginationLink isActive={(table.getState()?.pagination?.pageIndex ?? 0) === ix}
                          onClick={() => table.setPageIndex(ix)}>{ix}</PaginationLink>
        </PaginationItem>)}
        <PaginationItem>
          <PaginationNext onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </>;
};

export default DataTable;
