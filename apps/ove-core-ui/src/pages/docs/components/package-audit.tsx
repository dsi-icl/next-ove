import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ove/ui-base-components";

import { docs, type PnpmAuditReport } from "../../../utils/api";

// type PnpmAudit = {
//   advisories: Record<string, any>;
//   actions: any[];
//   metadata: {
//     vulnerabilities: Record<string, number>;
//   };
// };
//
type Vulnerability = {
  id: string;
  package: string;
  vulnerableRange: string;
  severity: string;
  overview?: string;
  recommendation?: string;
  url?: string;
  paths: string[];
  fixCommand?: string;
};

function extractUpgradeVersion(patchedVersions?: string): string | undefined {
  if (!patchedVersions) return undefined;

  // Split OR ranges: ">=4.0.0 || >=5.1.2"
  const orParts = patchedVersions.split("||").map((p) => p.trim());

  for (const part of orParts) {
    // Find >= version
    const match = part.match(/>=\s*([0-9][^ <]*)/);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

function mapPnpmAuditToVulnerabilities(
  audit: PnpmAuditReport,
): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];

  const actionsByModule = new Map<string, any>();

  audit.actions?.forEach((action) => {
    if (action.module) {
      actionsByModule.set(action.module, action);
    }
  });

  Object.values(audit.advisories || {}).forEach((adv: any) => {
    const findingsPaths =
      adv.findings?.flatMap((f: any) => f.paths || []) ?? [];

    const upgradeVersion = extractUpgradeVersion(
      adv.patched_versions,
    );

    vulnerabilities.push({
      id: String(adv.id),
      package: adv.module_name,
      vulnerableRange: adv.vulnerable_versions,
      severity: adv.severity ?? "unknown",
      overview: adv.overview,
      recommendation: adv.recommendation,
      url: adv.url,
      paths: findingsPaths,
      fixCommand: upgradeVersion
        ? `pnpm up ${adv.module_name}@${upgradeVersion}`
        : undefined,
    });
  });

  return vulnerabilities;
}

const severityStyles = (severity: string) => {
  switch (severity) {
    case "critical":
      return "border-l-4 border-red-600";
    case "high":
      return "border-l-4 border-orange-500";
    case "moderate":
      return "border-l-4 border-yellow-500";
    case "low":
      return "border-l-4 border-green-500";
    default:
      return "border-l-4 border-muted";
  }
};

const severityBadgeVariant = (
  severity: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "secondary";
    case "moderate":
      return "outline";
    case "low":
      return "default";
    default:
      return "outline";
  }
};

const VulnerabilityList = ({
  items,
}: {
  items: Vulnerability[];
}) => {
  if (!items.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No vulnerabilities in this category.
      </p>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-4">
        {items.map((vuln) => (
          <Card
            key={vuln.id}
            className={`p-4 ${severityStyles(vuln.severity)}`}
          >
            <CardContent className="space-y-4 p-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {vuln.package}
                  </h3>
                  {vuln.vulnerableRange && (
                    <p className="text-muted-foreground font-mono text-xs">
                      Vulnerable: {vuln.vulnerableRange}
                    </p>
                  )}
                </div>

                <Badge variant={severityBadgeVariant(vuln.severity)}>
                  {vuln.severity}
                </Badge>
              </div>

              {/* Overview */}
              {vuln.overview && (
                <p className="text-sm text-muted-foreground">
                  {vuln.overview}
                </p>
              )}

              {/* Advisory Link */}
              {vuln.url && (
                <a
                  href={vuln.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                >
                  View Advisory
                </a>
              )}

              {/* Recommendation */}
              {vuln.recommendation && (
                <Badge variant="outline" className="font-mono">
                  {vuln.recommendation}
                </Badge>
              )}

              {/* Fix Command */}
              {vuln.fixCommand && (
                <Alert>
                  <AlertDescription className="font-mono text-xs">
                    {vuln.fixCommand}
                  </AlertDescription>
                </Alert>
              )}

              {/* Paths */}
              {vuln.paths.length > 0 && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="paths">
                    <AccordionTrigger>
                      Affected Paths ({vuln.paths.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 font-mono text-xs">
                        {vuln.paths.map((path, i) => (
                          <div key={i}>{path}</div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

const PackageAudit = () => {
  const { data: auditJson } = docs.getPackageAudit.useQuery();

  const vulnerabilities = useMemo(() => {
    if (!auditJson) return [];
    return mapPnpmAuditToVulnerabilities(auditJson);
  }, [auditJson]);

  const grouped = useMemo(() => {
    return vulnerabilities.reduce<Record<string, Vulnerability[]>>(
      (acc, vuln) => {
        const key = vuln.severity || "unknown";
        acc[key] = acc[key] || [];
        acc[key].push(vuln);
        return acc;
      },
      {},
    );
  }, [vulnerabilities]);

  const severities = ["critical", "high", "moderate", "low", "unknown"];

  return (
    <Card className="size-full">
      <CardHeader>
        <CardTitle>NPM Audit Report</CardTitle>
      </CardHeader>

      <CardContent className="w-full max-w-[unset] h-full">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All ({vulnerabilities.length})
            </TabsTrigger>
            {severities.map((sev) => (
              <TabsTrigger key={sev} value={sev}>
                {sev} ({grouped[sev]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <VulnerabilityList items={vulnerabilities} />
          </TabsContent>

          {severities.map((sev) => (
            <TabsContent key={sev} value={sev}>
              <VulnerabilityList items={grouped[sev] || []} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PackageAudit;