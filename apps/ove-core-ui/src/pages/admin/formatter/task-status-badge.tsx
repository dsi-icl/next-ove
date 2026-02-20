import { Badge } from "@ove/ui-base-components";

type Props = {
  state: "pending" | "processing" | "completed" | "failed";
};

const TaskStatusBadge = ({ state }: Props) => {
  const variantMap = {
    pending: "outline",
    processing: "default",
    completed: "green",
    failed: "red",
  } as const;

  return (
    <Badge variant={variantMap[state]} className="capitalize">
      {state}
    </Badge>
  );
};

export default TaskStatusBadge;
