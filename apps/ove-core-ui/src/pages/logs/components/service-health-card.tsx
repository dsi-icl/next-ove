import { useLogsStore } from "../store";
import { api } from "../../../utils/api";
import { Card, CardHeader, CardContent } from "@ove/ui-base-components";

const ServiceHealthCard = () => {
  const filters = useLogsStore();

  const { data } =
    api.logs.serviceHealth.useQuery({
      start: filters.start,
      end: filters.end,
    });

  return (
    <Card>
      <CardHeader>Service Health</CardHeader>
      <CardContent className="space-y-3">
        {data?.map((s) => {
          const color =
            s.error_rate > 0.05
              ? "bg-red-500"
              : s.error_rate > 0.01
                ? "bg-yellow-500"
                : "bg-green-500";

          return (
            <div
              key={s.service}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span>{s.service}</span>
                <span>
                  {(s.error_rate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="h-2 rounded bg-muted">
                <div
                  className={`h-2 rounded ${color}`}
                  style={{
                    width: `${Math.min(
                      s.error_rate * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ServiceHealthCard;