import { useFileWithEdit, useUpload } from "../hooks/files";
import ace from "ace-builds";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ove/ui-base-components";
import AceEditor from "react-ace";
import { Save } from "lucide-react";
import React, { useCallback } from "react";
import url from "ace-builds/src-noconflict/mode-html";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.setModuleUrl("ace/mode/json", url);

type ControllerEditorProps = {
  projectId: string;
  bucket: string;
};

const ControllerEditor = ({ projectId, bucket }: ControllerEditorProps) => {
  const {
    data,
    setData,
    file: controller,
    initial,
  } = useFileWithEdit("control.html", bucket, projectId);
  const uploadFile = useUpload(projectId, controller);

  const save = useCallback(async () => {
    await uploadFile(new File([data], controller.name, { type: "text/plain" }));
  }, [uploadFile, controller.name, data]);

  return (
    <DialogContent className="m-0 aspect-video w-[80vw] max-w-[unset] gap-0 space-y-0 rounded-xl border-0 border-transparent bg-transparent p-0 text-white">
      <DialogHeader className="h-16 justify-center space-y-0 rounded-t-xl bg-[#002147] pl-4 text-white">
        <DialogTitle>Demo Controller Editor</DialogTitle>
        <DialogDescription>
          Create a custom controller for operating the demo
        </DialogDescription>
      </DialogHeader>
      {initial !== null ? (
        <AceEditor
          placeholder="Controller"
          theme="dracula"
          mode="html"
          name="controller-config"
          defaultValue={initial}
          style={{ width: "100%", height: "calc(((80vw/16)*9) - 8rem)" }}
          onChange={setData}
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={false}
          value={data}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
            useWorker: false,
          }}
        />
      ) : null}
      <DialogFooter className="flex h-16 items-center rounded-b-xl bg-[#002147]">
        <DialogClose asChild>
          <Button variant="outline" className="mr-4 text-black">
            <Save className="mr-1 size-4" onClick={save} />
            Save
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default ControllerEditor;
