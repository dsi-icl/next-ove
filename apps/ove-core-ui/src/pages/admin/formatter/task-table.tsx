import { api } from "../../../utils/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ove/ui-base-components";
import TaskStatusBadge from "./task-status-badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  groupName: string;
  tasks: {
    state: "pending" | "processing" | "completed" | "failed";
    created_at: string;
    completed_at?: string;
    type: "dzi" | "latex" | "markdown";
    file: string;
    error?: string;
  }[];
};

const TaskTable = ({ groupName, tasks }: Props) => {
  const utils = api.useUtils();

  const rerunMutation = api.admin.rerunTask.useMutation({
    onSuccess: async () => {
      await utils.admin.getTasks.invalidate();
    },
  });

  const handleRerun = (
    file: string,
    taskType: "dzi" | "markdown" | "latex",
  ) => {
    const [bucketName, ...rest] = file.split("/");
    const objectName = rest.join("/").split("?").at(0) ?? "";
    const versionId = new URLSearchParams(file).get("version_id") ?? "latest";

    toast.promise(
      rerunMutation.mutateAsync({
        bucketName,
        objectName,
        versionId,
        taskType,
      }),
      {
        loading: "Queueing task for rerunning",
        success: "Task queued for rerun",
        error: "Failed to queue task for rerun",
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{groupName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b pb-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TaskStatusBadge state={task.state} />
                <span className="text-sm font-medium capitalize">
                  {task.type === "dzi" ? "DZI" : task.type}
                </span>
              </div>

              <p className="text-muted-foreground text-sm">{task.file}</p>

              <p className="text-muted-foreground text-xs">
                Created: {formatDistanceToNow(new Date(task.created_at), {
                  addSuffix: true,
                })}
              </p>

              <p className="text-muted-foreground text-xs">
                Completed: {task.completed_at !== undefined ? formatDistanceToNow(new Date(task.completed_at), {
                  addSuffix: true,
                }) : "-"}
              </p>

              {task.error && (
                <p className="text-destructive text-xs">{task.error}</p>
              )}
            </div>

            {task.state === "failed" && (
              <Button
                size="sm"
                variant="destructive"
                disabled={rerunMutation.isPending}
                onClick={() => handleRerun(task.file, task.type)}
              >
                {rerunMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Rerun
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TaskTable;
