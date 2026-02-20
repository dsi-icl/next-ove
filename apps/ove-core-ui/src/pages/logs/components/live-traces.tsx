import { useState, useCallback } from "react";

import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
} from "@ove/ui-base-components";
import { useLogsStore } from "../store";
import { useLiveSocket } from "../socket";
import { formatDurationNs, shortId } from "../utils";

const MAX_ROWS = 200;

const LiveTraces = () => {
  const [rows, setRows] = useState<any[]>([]);
  const setSelectedTrace = useLogsStore((state) => state.setSelectedTrace);
  const live = useLogsStore((state) => state.live);

  const handleMessage = useCallback((spans: any) => {
    setRows((prev) => {
      const updated = [...prev, ...spans];
      return updated.slice(0 - MAX_ROWS);
    });
  }, []);

  useLiveSocket("liveSpans", handleMessage, live);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>Live Traces</div>
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
            {rows.map((span) => (
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
                    variant={
                      span.status_code === "ERROR" ? "red" : "green"
                    }
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
      </CardContent>
    </Card>
  );
};

export default LiveTraces;
