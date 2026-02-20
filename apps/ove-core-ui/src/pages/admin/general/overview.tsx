import {
  Badge,
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ove/ui-base-components";
import {
  IconArrowRight,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { api } from "../../../utils/api";

const toDP = (value: string | undefined, dp: number) => {
  if (value === undefined) return "-"
  return +parseFloat(value).toFixed(dp).toString();
};

const getIcon = (change: number) => {
  if (change > 0) {
    return <IconTrendingUp className="size-4" />;
  } else if (change < 0) {
    return <IconTrendingDown className="size-4" />;
  } else {
    return <IconArrowRight className="size-4" />;
  }
};

const DemoLaunchCard = () => {
  const getDemoLaunches = api.admin.getDemoLaunches.useQuery();

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex">
          <CardDescription>Projects Launches</CardDescription>
          <CardAction className="ml-auto">
            <Badge variant="outline">
              {getIcon(getDemoLaunches.data?.percentChange ?? 0)}
              {(getDemoLaunches.data?.percentChange ?? 1) > 0 ? "+" : ""}
              {toDP(getDemoLaunches.data?.percentChange?.toString(), 2)}%
            </Badge>
          </CardAction>
        </div>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {getDemoLaunches.data?.total ?? "-"}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">Number of demos launched</div>
      </CardFooter>
    </Card>
  );
};

const ProjectCountCard = () => {
  const getProjectCount = api.admin.getProjectCount.useQuery();

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex">
          <CardDescription>Total Projects</CardDescription>
          <CardAction className="ml-auto">
            <Badge variant="outline">
              {getIcon(getProjectCount.data?.change ?? 0)}
              {(getProjectCount.data?.change ?? 1) > 0 ? "+" : ""}
              {toDP(getProjectCount.data?.change.toString(), 2)}%
            </Badge>
          </CardAction>
        </div>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {getProjectCount.data?.total ?? "-"}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          Total projects and change in last 30 days.
        </div>
      </CardFooter>
    </Card>
  );
};

const GeneralOverview = () => {
  return (
    <main className="h-full w-full">
      <h1 className="w-full py-4 text-center text-4xl font-bold">
        Admin Dashboard
      </h1>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t lg:px-6">
        <ProjectCountCard />
        <DemoLaunchCard />
      </div>
    </main>
  );
};

export default GeneralOverview;
