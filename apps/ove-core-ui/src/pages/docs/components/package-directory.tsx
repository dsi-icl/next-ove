import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Badge,
  Collapsible,
  CollapsibleContent,
} from "@ove/ui-base-components";
import { ChevronRight, ChevronDown, Package } from "lucide-react";

import { docs } from "../../../utils/api";
import type { PnpmProject, PnpmNode } from "../../../utils/api";

const TreeNode = ({
  name,
  node,
  level,
}: {
  name: string;
  node: PnpmNode;
  level: number;
}) => {
  const [open, setOpen] = useState(level < 1);

  const hasDeps =
    node.dependencies &&
    Object.keys(node.dependencies).length > 0;

  return (
    <div style={{ marginLeft: level * 16 }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted rounded px-2"
          onClick={() => hasDeps && setOpen(!open)}
        >
          {hasDeps ? (
            open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4" />
          )}

          <span className="font-medium">{name}</span>

          {node.version && (
            <Badge variant="outline">{node.version}</Badge>
          )}
        </div>

        {hasDeps && (
          <CollapsibleContent>
            {Object.entries(node.dependencies!).map(
              ([childName, childNode]) => (
                <TreeNode
                  key={childName}
                  name={childName}
                  node={childNode}
                  level={level + 1}
                />
              )
            )}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
};

const PackageDirectory = () => {
  const { data } = docs.getPackageDirectory.useQuery();

  if (!data || data.length === 0) return <div />;

  // pnpm returns an array of projects
  const project = data[0] as PnpmProject;

  return (
    <Card className="size-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          {project.name}
          {project.version && (
            <Badge variant="secondary">{project.version}</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="max-w-[unset]">
        <ScrollArea className="h-full pr-4">
          {project.dependencies &&
            Object.entries(project.dependencies).map(
              ([name, node]) => (
                <TreeNode
                  key={name}
                  name={name}
                  node={node}
                  level={0}
                />
              )
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PackageDirectory;