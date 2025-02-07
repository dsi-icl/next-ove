import {
  useFileWithEdit,
  useUpload
} from "../hooks/files";
import ace from "ace-builds";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@ove/ui-base-components";
import AceEditor from "react-ace";
import { Save } from "lucide-react";
import React, { useCallback } from "react";
import url from "ace-builds/src-noconflict/mode-html";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.setModuleUrl("ace/mode/json", url);

type ControllerEditorProps = {
  projectId: string
  bucket: string
}

const ControllerEditor = ({
  projectId,
  bucket
}: ControllerEditorProps) => {
  const {data, setData, file: controller, initial} = useFileWithEdit("control.html", bucket, projectId);
  const uploadFile = useUpload(projectId, controller);

  const save = useCallback(async () => {
    await uploadFile(new File([data], controller.name, {type: "text/plain"}))
  }, [uploadFile, controller.name, data]);

  return <DialogContent className="w-[80vw] aspect-video text-white gap-0 space-y-0 bg-transparent border-transparent rounded-xl border-0 max-w-[unset] p-0 m-0">
      <DialogHeader className="rounded-t-xl text-white h-16 justify-center pl-4 bg-[#002147] space-y-0">
        <DialogTitle>Demo Controller Editor</DialogTitle>
        <DialogDescription>Create a custom controller for operating the demo</DialogDescription>
      </DialogHeader>
    {initial !== null ? <AceEditor
      placeholder="Controller"
      theme="dracula"
      mode="html"
      name="controller-config"
      defaultValue={initial}
      style={{width: "100%", height: "calc(((80vw/16)*9) - 8rem)"}}
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
        useWorker: false
      }}
    /> : null}
    <DialogFooter className="h-16 bg-[#002147] rounded-b-xl flex items-center">
      <DialogClose asChild><Button variant="outline" className="text-black mr-4">
        <Save className="h-4 w-4 mr-1" onClick={save} />
        Save
      </Button></DialogClose>
    </DialogFooter>
  </DialogContent>;
};

export default ControllerEditor;
