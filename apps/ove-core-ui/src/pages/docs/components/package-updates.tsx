import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Separator } from "@ove/ui-base-components";
import { docs } from "../../../utils/api";

type DependencyUpdate = {
  name: string;
  current: string;
  target: string;
  type: "major" | "minor" | "patch" | "unknown";
};

function getUpdateType(
  current: string,
  target: string
): DependencyUpdate["type"] {
  const parse = (v: string) =>
    v.replace(/^[^\d]*/, "").split(".").map(Number);

  const [cMajor, cMinor, cPatch] = parse(current);
  const [tMajor, tMinor, tPatch] = parse(target);

  if (tMajor > cMajor) return "major";
  if (tMinor > cMinor) return "minor";
  if (tPatch > cPatch) return "patch";

  return "unknown";
}

function parseTazeOutput(raw: string): DependencyUpdate[] {
  const regex =
    /^(@?[\w./-]+)\s+(~?\w+)\s+([^\s]+)\s+→\s+([^\s]+)\s+(~?\w+)/;

  return raw
    .split("\n")
    .map((line) => line.trim())
    .map((line) => {
      const match = line.match(regex);
      if (!match) return null;

      const [, name, , current, target] = match;

      return {
        name,
        current,
        target,
        type: getUpdateType(current, target),
      };
    })
    .filter(Boolean) as DependencyUpdate[];
}

const PackageUpdates = () => {
  const { data: rawOutput } = docs.getPackageUpdates.useQuery();
  const updates = useMemo(
    () => {
      if (rawOutput === undefined) return [];
      return parseTazeOutput(rawOutput)
    },
    [rawOutput]
  );

  const stats = useMemo(() => {
    return {
      total: updates.length,
      major: updates.filter((u) => u.type === "major").length,
      minor: updates.filter((u) => u.type === "minor").length,
      patch: updates.filter((u) => u.type === "patch").length,
    };
  }, [updates]);

  const badgeVariant = (type: DependencyUpdate["type"]) => {
    switch (type) {
      case "major":
        return "destructive";
      case "minor":
        return "default";
      case "patch":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dependency Update Analysis</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Total: {stats.total}
          </Badge>
          <Badge variant="destructive">
            Major: {stats.major}
          </Badge>
          <Badge variant="default">
            Minor: {stats.minor}
          </Badge>
          <Badge variant="secondary">
            Patch: {stats.patch}
          </Badge>
        </div>

        <Separator />

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.map((update) => (
              <TableRow key={update.name}>
                <TableCell className="font-medium">
                  {update.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {update.current}
                </TableCell>
                <TableCell>
                  {update.target}
                </TableCell>
                <TableCell>
                  <Badge variant={badgeVariant(update.type)}>
                    {update.type.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {updates.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No dependency updates detected.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PackageUpdates;