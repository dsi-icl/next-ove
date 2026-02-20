import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Accordion, AccordionContent, AccordionItem, AccordionTrigger, ScrollArea } from "@ove/ui-base-components";

import { docs } from "../../../utils/api";

type DeprecatedPackage = {
  name: string;
  chain: string[];
};

const parseDeprecationOutput = (raw: string): DeprecatedPackage[] => {
  const lines = raw.split("\n").filter(Boolean);

  const results: DeprecatedPackage[] = [];

  for (const line of lines) {
    if (!line.startsWith("package")) continue;

    const match = line.match(
      /package (.+?) is deprecated, chain of dependency is \[(.+?)]/,
    );

    if (!match) continue;

    const name = match[1].trim();
    const chain = match[2].split("->").map((p) => p.trim());

    results.push({ name, chain });
  }

  return results;
};

const PackageDeprecation = () => {
  const { data: rawOutput } = docs.getPackageDeprecation.useQuery();
  const data = useMemo(
    () => {
      if (rawOutput === undefined) return [];
      return parseDeprecationOutput(rawOutput);

    }, [rawOutput]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Deprecated Dependencies ({data.length})</CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <Accordion type="multiple" className="w-full">
            {data.map((pkg, index) => (
              <AccordionItem key={pkg.name} value={`${pkg.name}-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-red-600">{pkg.name}</span>
                    {pkg.chain.length === 1 && (
                      <Badge variant="destructive">Direct dependency</Badge>
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {pkg.chain.map((dep, i) => (
                      <React.Fragment key={dep + i}>
                        <Badge variant="secondary">{dep}</Badge>
                        {i < pkg.chain.length - 1 && (
                          <span className="text-muted-foreground">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PackageDeprecation;
