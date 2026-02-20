import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Badge,
} from "@ove/ui-base-components";

const Overview = () => {
  return (
    <div className="container mx-auto max-w-5xl space-y-10 py-10">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Project Documentation Overview
        </h1>
        <p className="text-muted-foreground text-lg">
          This documentation site provides a complete view of the project — from
          source-level API documentation to dependency health, security,
          coverage, and external specifications.
        </p>
      </div>

      <Separator />

      {/* Documentation Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Code Documentation</CardTitle>
            <CardDescription>Generated API-level documentation</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <div>
              <Badge variant="secondary">JSDoc</Badge>
              <p>
                Inline documentation extracted from source comments. Use this to
                understand function behavior, parameters, return values, and
                usage examples.
              </p>
            </div>
            <div>
              <Badge variant="secondary">TypeDoc</Badge>
              <p>
                Structured type-level documentation. Explore interfaces,
                generics, type relationships, and public API surface area.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Documentation</CardTitle>
            <CardDescription>
              Hand-written conceptual documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Detailed explanations of major features, architecture decisions,
            workflows, and integration patterns. Start here if you want
            conceptual understanding rather than API details.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build & Bundle Analysis</CardTitle>
            <CardDescription>
              Understand performance and bundle composition
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <div>
              <Badge variant="secondary">vite-bundle-visualizer</Badge>
              <p>
                Visual breakdown of bundle contents. Identify large dependencies
                and optimization opportunities.
              </p>
            </div>
            <div>
              <Badge variant="secondary">doiuse</Badge>
              <p>
                CSS compatibility analysis. Highlights unsupported features
                across target browsers.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dependency Health</CardTitle>
            <CardDescription>
              Audit, updates, and deprecation status
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <div>
              <Badge variant="secondary">npm audit</Badge>
              <p>
                Security vulnerability report for installed packages. Review
                severity levels and recommended fixes.
              </p>
            </div>
            <div>
              <Badge variant="secondary">Dependency-Deprecated-Checker</Badge>
              <p>Identifies deprecated packages that may require migration.</p>
            </div>
            <div>
              <Badge variant="secondary">taze</Badge>
              <p>
                Lists available package updates and version drift across the
                dependency tree.
              </p>
            </div>
            <div>
              <Badge variant="secondary">npm ls</Badge>
              <p>
                Displays the full dependency tree, useful for tracing nested
                packages and version conflicts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Analysis</CardTitle>
            <CardDescription>Deep package-level inspection</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <div>
              <Badge variant="secondary">Sandworm</Badge>
              <p>
                Advanced dependency security analysis. Detects suspicious
                patterns, supply-chain risks, and malicious indicators.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage & Quality Metrics</CardTitle>
            <CardDescription>
              Measure correctness and completeness
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <div>
              <Badge variant="secondary">Type Coverage</Badge>
              <p>
                Generated by typescript-coverage-report. Shows how much of the
                codebase is strictly typed versus using any or implicit types.
              </p>
            </div>
            <div>
              <Badge variant="secondary">Test Coverage</Badge>
              <p>
                Generated by Jest. Displays line, branch, and function coverage
                to assess test completeness.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>External Specifications</CardTitle>
            <CardDescription>Standards and external interfaces</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-sm">
            <div>
              <Badge variant="secondary">PDF Specifications</Badge>
              <p>
                Authoritative external specifications relied upon by the project
                (e.g., Samsung MDC specification). Use these when validating
                protocol or device behavior.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>APIs</CardTitle>
            <CardDescription>
              OpenAPI documentation for next-ove components
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-sm">
            <div>
              <Badge variant="secondary">OpenAPI (Scalar)</Badge>
              <p>
                Interactive API documentation powered by Scalar. Explore
                endpoints, schemas, authentication, and example requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="text-muted-foreground text-sm">
        Use the sidebar to navigate between sections. Each tool focuses on a
        different dimension of the project: correctness, security,
        maintainability, performance, or documentation depth.
      </div>
    </div>
  );
};

export default Overview;
