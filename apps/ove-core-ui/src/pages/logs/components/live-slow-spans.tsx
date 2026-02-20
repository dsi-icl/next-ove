import { useCallback, useState } from "react";

import { useLogsStore } from "../store";
import { useLiveSocket } from "../socket";
import { Card, CardHeader, CardContent } from "@ove/ui-base-components";

type Span = {
  span_id: string;
  service: string;
  name: string;
  duration_ns: number;
  live_id: string;
}

const LiveSlowSpans = () => {
  const [spans, setSpans] = useState<Span[]>([]);
  const live = useLogsStore((state) => state.live);

  const handleMessage = useCallback((spans: Span[]) => {
    setSpans((prev) => {
      const updated = [...prev, ...spans];
      return updated.slice(0 - 200);
    });
  }, []);

  useLiveSocket("slowSpans", handleMessage, live);

  return (
    <Card>
      <CardHeader>Live Slow Spans</CardHeader>
      <CardContent className="space-y-2">
        {spans.map((s) => (
          <div
            key={s.live_id}
            className="p-2 border rounded text-sm"
          >
            <div className="font-medium">{s.service}</div>
            <div>{s.name}</div>
            <div className="text-red-500">
              {(s.duration_ns / 1e6).toFixed(2)} ms
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LiveSlowSpans;