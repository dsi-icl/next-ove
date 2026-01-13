import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@ove/ui-base-components";
import Canvas from "./components/canvas";
import Actions from "./components/actions";
import { useDialog } from "./hooks/dialog";
import Sections from "./components/sections";
import StateTabs from "./components/state-tabs";
import { Dialog } from "@ove/ui-base-components";
import SectionConfig from "./components/section-config";
import ObservatoryConfig from "./components/observatory-config";
import { useSectionStore } from "./hooks/stores";

const ProjectEditor = () => {
  const { isOpen, open, close, content, setAction } = useDialog();
  const selectedSection = useSectionStore((state) => state.selectedSection);

  return (
    <Dialog open={isOpen} onOpenChange={(state) => (state ? open() : close())}>
      <main className="h-[90vh] w-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={95}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={55}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={75}>
                    <StateTabs />
                    <Canvas />
                  </ResizablePanel>
                  <ResizableHandle withHandle={!isOpen} />
                  <ResizablePanel defaultSize={25}>
                    <Sections />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle withHandle={!isOpen} />
              <ResizablePanel defaultSize={45}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={20}>
                    <ObservatoryConfig />
                  </ResizablePanel>
                  <ResizableHandle withHandle={!isOpen} />
                  <ResizablePanel defaultSize={80}>
                    {selectedSection !== null ? <SectionConfig setAction={setAction} openDialog={open} /> : null}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle={!isOpen} />
          <ResizablePanel defaultSize={5}>
            <Actions setAction={setAction} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      {content}
    </Dialog>
  );
};

export default ProjectEditor;
