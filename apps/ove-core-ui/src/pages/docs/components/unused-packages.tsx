import {
  docs,
  type KnipIssueFile,
  type KnipLocation,
} from "../../../utils/api";
import {
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
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FlattenedIssue extends KnipLocation {
  file: string;
  type: string;
}

const flattenIssues = (issues: KnipIssueFile[]): FlattenedIssue[] => {
  const result: FlattenedIssue[] = [];

  for (const issue of issues) {
    const categories: Array<keyof Omit<KnipIssueFile, "file" | "enumMembers">> =
      [
        "dependencies",
        "devDependencies",
        "optionalPeerDependencies",
        "unlisted",
        "binaries",
        "unresolved",
        "exports",
        "types",
        "duplicates",
        "catalog",
      ];

    for (const category of categories) {
      for (const item of issue[category] as KnipLocation[]) {
        result.push({
          ...item,
          file: issue.file,
          type: category,
        });
      }
    }
  }

  return result;
};

const UnusedPackages = () => {
  const { data } = docs.getUnusedPackages.useQuery();
  const flattened = flattenIssues(data?.issues ?? []);

  const categories = Array.from(new Set(flattened.map((i) => i.type)));

  const counts = categories.map((type) => ({
    name: type,
    value: flattened.filter((i) => i.type === type).length,
  }));

  const renderList = (type: string) => {
    const items = flattened.filter((i) => i.type === type);

    return (
      <ScrollArea className="h-full w-full rounded-md border p-4">
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item.file}-${item.name}-${index}`}
              className="bg-muted space-y-1 rounded p-3 text-sm"
            >
              <div className="font-semibold">{item.name}</div>
              <div className="text-muted-foreground text-xs">{item.file}</div>
              {item.line && (
                <div className="text-muted-foreground text-xs">
                  Line {item.line}, Col {item.col}
                </div>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6 p-6 size-full">
      <Card>
        <CardHeader>
          <CardTitle>Knip Issues Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] max-w-[unset]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={counts}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue={categories[0]}>
        <TabsList className="flex flex-wrap gap-2">
          {categories.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type}
              <Badge className="ml-2">
                {flattened.filter((i) => i.type === type).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((type) => (
          <TabsContent key={type} value={type}>
            {renderList(type)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UnusedPackages;
