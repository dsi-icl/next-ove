import DataTable from "../../../components/data-table/data-table";
import { columns, getSize } from "./columns";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useHistoricalLogs } from "../hooks/historical-logs";
import { usePages } from "../hooks/pages";
import { useSorting } from "../hooks/sorting";

type HistoricalProps = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  appIds: string[] | undefined;
  levels: string[] | undefined;
  keywords: string[] | undefined;
};

const Historical = ({
  startDate,
  endDate,
  appIds,
  levels,
  keywords,
}: HistoricalProps) => {
  const { sorting, setSorting, dbSorting } = useSorting();
  const { pageCount, pageIndex, setPageIndex, pageSize } = usePages(
    startDate === undefined && endDate === undefined
      ? undefined
      : [
          {
            start: startDate ?? null,
            end: endDate ?? null,
          },
        ],
    appIds,
    levels,
    keywords,
  );
  const logs = useHistoricalLogs(
    pageIndex,
    dbSorting,
    startDate === undefined && endDate === undefined
      ? undefined
      : [
          {
            start: startDate ?? null,
            end: endDate ?? null,
          },
        ],
    appIds,
    levels,
    keywords,
  );

  const table = useReactTable({
    data: logs,
    getRowId: (row) => row.id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (pg) => {
      if (typeof pg === "function") {
        setPageIndex(pg({ pageIndex: pageIndex, pageSize }).pageIndex);
      } else {
        setPageIndex(pg.pageIndex);
      }
    },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });
  return <DataTable table={table} columns={columns} getSize={getSize} />;
};

export default Historical;
