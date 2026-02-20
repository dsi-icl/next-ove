import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from "@ove/ui-base-components";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

type DocNode = {
  title: string;
  path?: string; // present if file
  children?: DocNode[]; // present if directory
};

const FeatureDocumentation = ({
  node,
  setFeature,
}: {
  node: DocNode;
  setFeature: (path: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const hasChildren =
    node.children && node.children.length > 0;

  // Directory node
  if (hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setOpen((o) => !o)}>
          <ChevronRight
            className={`mr-2 h-4 w-4 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
          {node.title === "index" ? "Overview" : node.title}
        </SidebarMenuButton>

        {open && (
          <SidebarMenuSub>
            {node.children!.map((child) => (
              <FeatureDocumentation
                key={child.title + (child.path ?? "")}
                node={child}
                setFeature={setFeature}
              />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  // Leaf node
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => node.path && setFeature(node.path)}
      >
        {node.title === "index" ? "Overview" : node.title}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default FeatureDocumentation;