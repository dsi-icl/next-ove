import { useLogsStore } from "../store";
import Filters from "./filters";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Sheet,
  SheetContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ove/ui-base-components";
import TraceExplorer from "./trace-explorer";
import { formatDurationNs, shortId } from "../utils";
import { api } from "../../../utils/api";
import { env } from "../../../env";
import { useEffect, useState } from "react";

const HistoricalTraces = () => {
  const [page, setPage] = useState(1);
  const selectedTrace = useLogsStore((state) => state.selectedTrace);
  const setSelectedTrace = useLogsStore((state) => state.setSelectedTrace);
  const start = useLogsStore((state) => state.start);
  const end = useLogsStore((state) => state.end);
  const { data } = api.logs.getTraces.useQuery({
    start,
    end,
    page,
    pageSize: env.PAGE_SIZE,
  });

  const rows = data?.traces ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / env.PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [start, end]);

  return (
    <div className="space-y-6 p-6">
      <Filters />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>Historical Traces</div>
        </CardHeader>

        <CardContent className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Span</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trace</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows?.map((span) => (
                <TableRow
                  key={span.live_id}
                  className="cursor-pointer"
                  onClick={() => setSelectedTrace(span.trace_id)}
                >
                  <TableCell>
                    {new Date(span.start_time).toLocaleTimeString()}
                  </TableCell>

                  <TableCell>{span.service}</TableCell>

                  <TableCell className="max-w-[200px] truncate">
                    {span.name}
                  </TableCell>

                  <TableCell>{formatDurationNs(span.duration_ns)}</TableCell>

                  <TableCell>
                    <Badge
                      variant={span.status_code === "ERROR" ? "red" : "green"}
                    >
                      {span.status_code}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {span.trace_id !== undefined ? shortId(span.trace_id) : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && setPage(page - 1)}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && setPage(page + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={!!selectedTrace}
        onOpenChange={() => setSelectedTrace(undefined)}
      >
        <SheetContent side="right" className="w-[800px] overflow-y-auto">
          <TraceExplorer traceId={selectedTrace} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HistoricalTraces;
