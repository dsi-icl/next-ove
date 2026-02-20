import { api } from "../../../utils/api";
import TaskTable from "./task-table";
import { Loader2 } from "lucide-react";
import { Button } from "@ove/ui-base-components";

const FormatterPage = () => {
  const { data, isLoading, refetch, isRefetching } =
    api.admin.getTasks.useQuery(undefined, {
      refetchInterval: 10000, // Auto-refresh every 10s
    });

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Formatter Tasks</h1>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data &&
          Object.entries(data).map(([group, tasks]) => (
            <TaskTable
              key={group}
              groupName={group}
              tasks={tasks}
            />
          ))}
      </div>
    </div>
  );
};

export default FormatterPage;
