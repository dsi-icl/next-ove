import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@ove/ui-base-components";
import { docs } from "../../../utils/api";

type SupportStatus = "supported" | "partial" | "unsupported";

type BrowserSupport = {
  status: SupportStatus;
  versions?: string;
};

type ParsedFeature = {
  id: string;
  title: string;
  browsers: Record<string, BrowserSupport>;
};

const KNOWN_BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"];

const formatFeatureTitle = (text: string) => text
  .split(" only partially supported")[0]
  .split(" not supported")[0]
  .trim();

const parseData = (data: Record<string, string>): ParsedFeature[] => {
  return Object.entries(data).map(([featureId, description]) => {
    const browsers: Record<string, BrowserSupport> = {};

    // Default everything to supported
    KNOWN_BROWSERS.forEach((browser) => {
      browsers[browser] = { status: "supported" };
    });

    let status: SupportStatus | null = null;
    let browserSection = "";

    if (description.includes("not supported by:")) {
      status = "unsupported";
      browserSection = description.split("not supported by:")[1];
    } else if (description.includes("only partially supported by:")) {
      status = "partial";
      browserSection = description.split(
        "only partially supported by:"
      )[1];
    }

    if (status && browserSection) {
      // Remove trailing (feature-id)
      browserSection = browserSection
        .replace(new RegExp(`\\(${featureId}\\)$`), "")
        .trim();

      // Split by comma but preserve browser entries
      const entries = browserSection.split(/,(?=\s*[A-Za-z])/);

      entries.forEach((entry) => {
        const match = entry.trim().match(/^([A-Za-z]+)\s*\((.*?)\)$/);
        if (!match) return;

        const [, browser, versions] = match;

        if (KNOWN_BROWSERS.includes(browser)) {
          browsers[browser] = {
            status,
            versions,
          };
        }
      });
    }

    return {
      id: featureId,
      title: formatFeatureTitle(description),
      browsers,
    };
  });
};

function SupportCell({ support }: { support: BrowserSupport }) {
  if (support.status === "supported") {
    return (
      <div className="text-green-700">
        ✅ Supported
        <div className="text-muted-foreground text-xs">
          All checked versions
        </div>
      </div>
    );
  }

  if (support.status === "partial") {
    return (
      <div className="text-yellow-700">
        ⚠️ Partial support
        {support.versions && (
          <div className="text-muted-foreground text-xs">
            Affected: {support.versions}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-red-700">
      ❌ Not supported
      {support.versions && (
        <div className="text-muted-foreground text-xs">
          Affected: {support.versions}
        </div>
      )}
    </div>
  );
}

const CSSCompatibility = () => {
  const { data } = docs.getBrowserUsage.useQuery();
  const parsed = useMemo(() => {
    if (data === undefined) return [];
    return parseData(data);
  }, [data]);

  return (
    <div className="rounded-lg border bg-card w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Feature</TableHead>
            {KNOWN_BROWSERS.map((browser) => (
              <TableHead key={browser} className="text-center">
                {browser}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {parsed.map((feature) => (
            <TableRow key={feature.id}>
              <TableCell className="font-medium align-top">
                <div className="space-y-1">
                  <div>{feature.title}</div>
                  <code className="text-xs text-muted-foreground">
                    {feature.id}
                  </code>
                </div>
              </TableCell>

              {KNOWN_BROWSERS.map((browser) => {
                const support = feature.browsers[browser];

                return (
                  <TableCell
                    key={browser}
                    className={cn(
                      "align-top text-sm",
                      support.status === "supported" &&
                      "bg-green-50",
                      support.status === "partial" &&
                      "bg-yellow-50",
                      support.status === "unsupported" &&
                      "bg-red-50"
                    )}
                  >
                    <SupportCell support={support} />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CSSCompatibility;