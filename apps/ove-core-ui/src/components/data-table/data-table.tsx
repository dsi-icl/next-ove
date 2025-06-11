import Empty from "./empty";
import { type ColumnDef, type Table as TTable } from "@tanstack/react-table";
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
import React from "react";

export type DataTableProps<TData extends { id: string }, TValue> = {
  table: TTable<TData>;
  columns: {
    [K in keyof TData]: ColumnDef<TData, TData[K]>;
  }[keyof TData][];
  getSize: (id: string) => string;
};

const DataTable = <TData extends { id: string }, TValue>({
  table,
  columns,
  getSize,
}: DataTableProps<TData, TValue>) => {
  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <HeaderRow group={group} key={group.id} getSize={getSize} />
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel()?.rows?.length > 0 ? (
            table.getRowModel().rows.map((row) => {
              return <BodyRow row={row} key={row.id} />;
            })
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
