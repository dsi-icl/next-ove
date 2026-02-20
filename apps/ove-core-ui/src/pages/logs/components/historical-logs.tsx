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
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
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
import { api } from "../../../utils/api";
import { levelVariant } from "../utils";
import { env } from "../../../env";
import { useState, useEffect } from "react";

const Overview = () => {
  const [page, setPage] = useState(1);
  const start = useLogsStore((state) => state.start);
  const end = useLogsStore((state) => state.end);
  const selectedTrace = useLogsStore((state) => state.selectedTrace);
  const setSelectedTrace = useLogsStore((state) => state.setSelectedTrace);
  const { data } = api.logs.getLogs.useQuery({
    start,
    end,
    page,
    pageSize: env.PAGE_SIZE,
  });

  const rows = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / env.PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [start, end]);

  return (
    <div className="space-y-6 p-6">
      <Filters />

      <Card>
        <CardHeader>Historical Logs</CardHeader>

        <CardContent className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Host</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows?.map((log) => (
                <TableRow
                  key={log.live_id}
                  className="cursor-pointer"
                  onClick={() => log.trace_id && setSelectedTrace(log.trace_id)}
                >
                  <TableCell>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>

                  <TableCell>{log.service}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        log.level !== undefined
                          ? levelVariant(log.level)
                          : "default"
                      }
                    >
                      {log.level}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-[400px] truncate">
                    {log.message}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {log.host}
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

export default Overview;
