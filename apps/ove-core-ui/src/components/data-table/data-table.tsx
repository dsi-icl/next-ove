import Empty from "./empty";
import { type ColumnDef, type Table as TTable } from "@tanstack/react-table";
import {
  Input,
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
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
import { useEffect, useState } from "react";

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
  const { pageIndex, pageSize } = table.getState().pagination;

  const totalRows = table.getFilteredRowModel().rows.length;
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  const [pageSizeInput, setPageSizeInput] = useState(String(pageSize));
  const [pageIndexInput, setPageIndexInput] = useState(String(pageIndex));

  useEffect(() => {
    setPageSizeInput(String(pageSize));
  }, [pageSize]);

  useEffect(() => {
    setPageIndexInput(String(pageIndex));
  }, [pageIndex]);

  useEffect(() => {
    if (!/\d+/.test(pageSizeInput)) return;
    if (Number(pageSizeInput) > 500) {
      setPageSizeInput(String(500));
      return;
    }
    if (Number(pageSizeInput) < 1) {
      setPageSizeInput(String(1));
      return;
    }
    table.setPageSize(Number(pageSizeInput));
  }, [pageSizeInput, table]);

  useEffect(() => {
    if (!/\d+/.test(pageIndexInput)) return;
    if (Number(pageIndexInput) > table.getPageCount() - 1) {
      setPageIndexInput(String(table.getPageCount() - 1));
      return;
    }
    if (Number(pageIndexInput) < 0) {
      setPageIndexInput(String(0));
      return;
    }
    table.setPageIndex(Number(pageIndexInput));
  }, [pageIndexInput, table]);

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
            table
              .getRowModel()
              .rows.map((row) => <BodyRow row={row} key={row.id} />)
          ) : (
            <Empty length={columns.length} />
          )}
        </TableBody>
      </Table>

      <div className="my-6 flex items-center justify-between gap-4">
        <Pagination>
          <PaginationContent>
            <div className="text-muted-foreground text-xs">Rows per page:</div>

            <div className="flex items-center gap-2 text-sm">
              <Input
                type="number"
                min={1}
                max={500}
                value={pageSizeInput}
                onChange={(e) => {
                  setPageSizeInput(e.target.value);
                }}
              />
            </div>

            <div className="text-muted-foreground text-xs">
              Showing {start}–{end} of {totalRows}
            </div>
            <PaginationItem className="pl-16">
              <PaginationFirst
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>

            {getPages(pageIndex, table.getPageCount()).map((ix) => (
              <PaginationItem key={ix}>
                <PaginationLink
                  isActive={pageIndex === ix}
                  onClick={() => table.setPageIndex(ix)}
                >
                  {ix + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
            <PaginationItem className="pr-16">
              <PaginationLast
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
            <span className="text-muted-foreground text-xs">Go to page:</span>
            <div className="flex items-center gap-2 text-sm">
              <Input
                type="number"
                min={1}
                max={table.getPageCount()}
                value={pageIndexInput}
                onChange={(e) => setPageIndexInput(e.target.value)}
                className="w-16 rounded border px-2 py-1 text-sm"
              />
            </div>
            <span className="text-muted-foreground text-xs">
              of {table.getPageCount()}
            </span>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
};

export default DataTable;
