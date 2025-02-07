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
import url from "ace-builds/src-noconflict/mode-json";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.setModuleUrl("ace/mode/json", url);

type EnvEditorProps = {
  projectId: string
  bucket: string
}

const EnvEditor = ({ projectId, bucket }: EnvEditorProps) => {
  const {data, setData, initial, file: env} = useFileWithEdit("env.json", bucket, projectId);
  const uploadFile = useUpload(projectId, env);

  const save = useCallback(async () => {
    await uploadFile(new File([data], env.name, { type: "text/plain" }));
  }, [uploadFile, data, env.name]);

  return <DialogContent className="w-[80vw] aspect-video text-white gap-0 space-y-0 bg-transparent border-transparent rounded-xl border-0 max-w-[unset] p-0 m-0" hasClose={false}>
    <DialogHeader className="rounded-t-xl text-white h-16 justify-center pl-4 bg-[#002147] space-y-0">
      <DialogTitle>Demo Environment Editor</DialogTitle>
      <DialogDescription>Add environment variables for the demo</DialogDescription>
    </DialogHeader>
    {initial !== null ? <AceEditor
    placeholder="Environment Config"
    theme="dracula"
    mode="json"
    name="environment-config"
    style={{ width: "100%", height: "calc(((80vw/16)*9) - 8rem)" }}
    defaultValue={initial}
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

export default EnvEditor;
