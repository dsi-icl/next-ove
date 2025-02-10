import Empty from "./empty";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Table,
  TableBody,
  TableHeader,
} from "@ove/ui-base-components";
import BodyRow from "./body-row";
import HeaderRow from "./header-row";
import { getPages } from "../../utils";
import type { FilterValue } from "./columns";
import React, { useEffect, useState } from "react";

type DataTableProps<TData extends { id: string }, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
} & FilterValue;

const DataTable = <TData extends { id: string }, TValue>({
  columns,
  data,
  filter,
  filterType,
  selected,
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
      columnFilters,
    },
  });

  useEffect(() => {
    table.getColumn(filterType)?.setFilterValue({
      filterType,
      filter,
      selected,
    });

    return () => {
      table.getColumn(filterType)?.setFilterValue({
        filterType,
        filter: null,
        selected: null,
      });
    };
  }, [filter, filterType, table, selected]);

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <HeaderRow group={group} key={group.id} />
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel()?.rows?.length > 0 ? (
            table
              .getRowModel()
              .rows.map((row) => <BodyRow row={row} key={row.id} />)
          ) : (
            <Empty length={columns.length} />
          )}
        </TableBody>
      </Table>
      <Pagination className="my-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            />
          </PaginationItem>
          {getPages(
            table.getState()?.pagination?.pageIndex ?? 0,
            table.getPageCount(),
          ).map((ix) => (
            <PaginationItem key={ix}>
              <PaginationLink
                isActive={(table.getState()?.pagination?.pageIndex ?? 0) === ix}
                onClick={() => table.setPageIndex(ix)}
              >
                {ix}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};

export default DataTable;
