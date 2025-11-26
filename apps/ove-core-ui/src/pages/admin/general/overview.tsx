import {
  Badge,
  Card,
  CardAction,
  // CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ove/ui-base-components";
import { IconTrendingUp } from "@tabler/icons-react";
import { api } from "../../../utils/api";

const ProjectCountCard = () => {
  const getProjectCount = api.admin.getProjectCount.useQuery();
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Total Projects</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {getProjectCount.data ?? "-"}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +12.5%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

const GeneralOverview = () => {
  return (
    <main>
      <h1>Admin Dashboard</h1>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <ProjectCountCard />
      </div>
    </main>
  );
};

/*
import React, { useMemo } from 'react'
import { trpc } from '@/utils/trpc'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Chart } from '@/components/ui/chart'

export default function DashboardPage() {
  // 1) simple stat: total users
  const {
    data: totalUsers = 0,
    isLoading: loadingUsers,
  } = trpc.dashboard.getUserCount.useQuery()

  // 2) chart data: revenue over last 7 days
  const {
    data: revenueMetrics = { labels: [], values: [] },
    isLoading: loadingRevenue,
  } = trpc.dashboard.getRevenueMetrics.useQuery()

  // prepare Chart.js data/options
  const lineData = useMemo(
    () => ({
      labels: revenueMetrics.labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueMetrics.values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3,
        },
      ],
    }),
    [revenueMetrics]
  )

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { position: 'bottom' as const },
        title: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    }),
    []
  )

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>
              {loadingUsers ? 'Loading…' : totalUsers}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The total number of registered users.
            </p>
          </CardContent>
        </Card>

        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue (Last 7 Days)</CardTitle>
              <CardDescription>
                {loadingRevenue ? 'Loading chart…' : 'Daily revenue trend'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Chart data={lineData} options={lineOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
)
}
 */

export default GeneralOverview;
