import { useCallback, useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ove/ui-base-components";
import { useLiveSocket } from "../socket";
import { useLogsStore } from "../store";
import { levelVariant } from "../utils";

const MAX_ROWS = 300;

const LiveLogs = () => {
  const [rows, setRows] = useState<any[]>([]);
  const setSelectedTrace = useLogsStore((state) => state.setSelectedTrace);
  const live = useLogsStore((state) => state.live);

  const handleMessage = useCallback((logs: any) => {
    setRows((prev) => {
      const updated = [...prev, ...logs];
      return updated.slice(0 - MAX_ROWS);
    });
  }, []);

  useLiveSocket("liveLogs", handleMessage, live);

  return (
    <Card>
      <CardHeader>Live Logs</CardHeader>

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
            {rows.map((log) => (
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
                  <Badge variant={log.level !== undefined ? levelVariant(log.level) : "default"}>{log.level}</Badge>
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
      </CardContent>
    </Card>
  );
};

export default LiveLogs;
