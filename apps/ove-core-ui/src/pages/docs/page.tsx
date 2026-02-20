import {
  SidebarProvider,
} from "@ove/ui-base-components";

import { env } from "../../env";
import DocsSidebar from "./sidebar";
import Overview from "./components/overview";
import { useDocsStore, type DocsView } from "./store";
import PackageAudit from "./components/package-audit";
import PackageUpdates from "./components/package-updates";
import UnusedPackages from "./components/unused-packages";
import CSSCompatibility from "./components/css-compatibility";
import PackageDirectory from "./components/package-directory";
import PackageDeprecation from "./components/package-deprecation";

const getContent = (view: DocsView, feature: string | undefined, test: string | undefined, api: string | undefined, bundle: string | undefined, spec: string | undefined)=> {
  switch (view) {
    case "overview":
      return <Overview />;
    case "code":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}/docs/code`}></iframe>
    case "features":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}${feature}`}></iframe>
    case "types":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}/docs/types`}></iframe>
    case "coverage-tests":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}${test}`}></iframe>
    case "coverage-types":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}/docs/coverage/types`}></iframe>
    case "apis":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}/api/docs?spec=${api}`}></iframe>
    case "css-compatibility":
      return <CSSCompatibility />
    case "package-audit":
      return <PackageAudit />
    case "package-deprecation":
      return <PackageDeprecation />;
    case "package-directory":
      return <PackageDirectory />;
    case "package-security":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}/docs/packages/security/treemap.svg`}></iframe>
    case "package-updates":
      return <PackageUpdates />;
    case "unused-packages":
      return <UnusedPackages />;
    case "spec":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}${spec}`}></iframe>
    case "bundle":
      return <iframe className="size-full min-h-[90vh]" src={`${env.CORE_URL}${bundle}`}></iframe>
  }
}

const DocumentationPage = () => {
  const view = useDocsStore((store) => store.view);
  const feature = useDocsStore((store) => store.feature);
  const test = useDocsStore((store) => store.test);
  const api = useDocsStore((store) => store.api);
  const bundle = useDocsStore((store) => store.bundle);
  const spec = useDocsStore((store) => store.spec);
  return (
    <SidebarProvider className="flex flex-row">
      <DocsSidebar />
      {getContent(view, feature, test, api, bundle, spec)}
    </SidebarProvider>
  );
};

export default DocumentationPage;
