import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ove/ui-base-components";
import { BarChart3, Cpu, Settings } from "lucide-react";

const Landing = () => (
  <main className="flex-1">
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              The next generation of the Open Visualisation Environment
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl font-semibold dark:text-gray-600">
              By Data Science Imperial
            </p>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Powerful tools for data visualization, hardware management, and
              project creation. All in one suite.
            </p>
          </div>
          <div className="space-x-4">
            <a href="/login">
              <Button>Get Started</Button>
            </a>
            <a href="https://github.com/dsi-icl/next-ove">
              <Button variant="outline">Learn More</Button>
            </a>
          </div>
        </div>
      </div>
    </section>
    <section className="w-full bg-gray-100 py-12 md:py-24 lg:py-32 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Comprehensive Suite of Tools
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 size-6" />
                Visual Project Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Create stunning visualizations with our intuitive drag-and-drop
                interface. Perfect for both beginners and experts.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="mr-2 size-6" />
                Hardware Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Efficiently manage your rendering hardware. Optimize performance
                and reduce costs with our smart allocation system.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 size-6" />
                Administrative Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Powerful administrative tools to manage users, projects, and
                resources. Stay in control of your data visualization workflow.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </main>
);

export default Landing;
