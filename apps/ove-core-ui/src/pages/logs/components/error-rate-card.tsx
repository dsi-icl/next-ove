import { Card, CardHeader, CardContent } from "@ove/ui-base-components";
import { api } from "../../../utils/api";
import { useLogsStore } from "../store";

const ErrorRateCard = () => {
  const filters = useLogsStore();

  const { data } =
    api.logs.serviceHealth.useQuery({
      start: filters.start,
      end: filters.end,
    });

  const totalErrors =
    data?.reduce(
      (acc: number, s: any) => acc + s.errors,
      0
    ) ?? 0;

  const totalRequests =
    data?.reduce(
      (acc: number, s: any) => acc + s.total,
      0
    ) ?? 0;

  const errorRate =
    totalRequests > 0
      ? (totalErrors / totalRequests) * 100
      : 0;

  return (
    <Card>
      <CardHeader>Global Error Rate</CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          {errorRate.toFixed(2)}%
        </div>
        <div className="text-muted-foreground text-sm">
          {totalErrors} errors / {totalRequests} requests
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorRateCard;
