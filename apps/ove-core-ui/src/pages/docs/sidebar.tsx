import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@ove/ui-base-components";
import { ChevronRight } from "lucide-react";
import { useDocsStore } from "./store";
import { api } from "../../utils/api";
import FeatureDocumentation from "./components/feature-documentation";

const DocsSidebar = () => {
  const setView = useDocsStore((store) => store.setView);
  const setFeature = useDocsStore((store) => store.setFeature);
  const setTest = useDocsStore((store) => store.setTest);
  const setApi = useDocsStore((store) => store.setApi);
  const setBundle = useDocsStore((store) => store.setBundle);
  const setSpec = useDocsStore((store) => store.setSpec);
  const getFeatures = api.docs.getFeatures.useQuery();
  const getSpecs = api.docs.getSpecs.useQuery();
  const getBundles = api.docs.getBundles.useQuery();
  const getAPIs = api.docs.getAPIs.useQuery();
  const getTests = api.docs.getTests.useQuery();
  return (
    <Sidebar className="top-[10vh]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("overview")}>
                  Overview
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>Code Documentation</SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView("code")}>
                JSDoc
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView("types")}>
                TypeDoc
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>Feature Documentation</SidebarGroupLabel>

            <SidebarMenu>
              {(getFeatures.data ?? []).map((node) => (
                <FeatureDocumentation
                  key={node.title}
                  node={node}
                  setFeature={setFeature}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Build & Bundle Analysis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ChevronRight className="mr-2 h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      <span>Build</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => setView("css-compatibility")}
                        >
                          CSS
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ChevronRight className="mr-2 h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      <span>Bundle</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {(getBundles.data ?? []).map((bundle) => (
                        <SidebarMenuSubItem key={bundle}>
                          <SidebarMenuSubButton
                            onClick={() => setBundle(bundle)}
                          >
                            {bundle.split("/").at(-1)?.split(".")?.at(0) ?? ""}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Dependency Health</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("package-audit")}>
                  Audit
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setView("package-deprecation")}
                >
                  Deprecation
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("package-directory")}>
                  Directory
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("package-updates")}>
                  Updates
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("unused-packages")}>
                  Unused
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Security Analysis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("package-security")}>
                  Dependencies
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Coverage & Quality Metrics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ChevronRight className="mr-2 h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      <span>Test Results & Coverage</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {(getTests.data ?? []).map((test) => (
                        <SidebarMenuSubItem key={test}>
                          <SidebarMenuSubButton onClick={() => setTest(test)}>
                            {test.split("/").at(-2) ?? ""}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView("coverage-types")}>
                  Type Coverage
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>External Specifications</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(getSpecs.data ?? []).map((spec) => (
                <SidebarMenuItem key={spec}>
                  <SidebarMenuButton onClick={() => setSpec(spec)}>
                    {spec
                      .split("/")
                      .at(-1)
                      ?.replace("_spec", "")
                      ?.split(".")
                      ?.at(0) ?? ""}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>APIs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(getAPIs.data ?? []).map((api) => (
                <SidebarMenuItem key={api}>
                  <SidebarMenuButton onClick={() => setApi(api)}>
                    {api.split("/").at(-2) ?? ""}/
                    {api.split("/").at(-1)?.split(".")[0] ?? ""}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DocsSidebar;
