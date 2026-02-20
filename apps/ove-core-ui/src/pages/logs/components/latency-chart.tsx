import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent } from "@ove/ui-base-components";
import { api } from "../../../utils/api";
import { useLogsStore } from "../store";

const LatencyChart = () => {
  const filters = useLogsStore();

  const { data } =
    api.logs.latencyOverTime.useQuery({
      start: filters.start,
      end: filters.end,
    });

  return (
    <Card>
      <CardHeader>p95 Latency (ms)</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data ?? []}>
            <XAxis dataKey="t" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="p95"
              stroke="#6366f1"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LatencyChart;
