import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useLogsStore } from "../store";
import { api } from "../../../utils/api";
import { Card, CardContent, CardHeader } from "@ove/ui-base-components";

const LatencyChart = () => {
  const filters = useLogsStore();
  const { data } = api.logs.latencyPercentiles.useQuery({
    start: filters.start,
    end: filters.end,
  });
  return (
    <Card>
      <CardHeader>p95 Latency</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="service" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="p95" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LatencyChart;
