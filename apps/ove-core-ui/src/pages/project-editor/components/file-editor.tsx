import { z } from "zod";
import ace from "ace-builds";
import {
  Button,
  DialogCloseX,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@ove/ui-base-components";
import AceEditor from "react-ace";
import { Save, X } from "lucide-react";
import React, { useState } from "react";
import { assert } from "@ove/ove-utils";
import { useForm } from "react-hook-form";
import { useUpload } from "../hooks/files";
import { useProjectId } from "../hooks/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrorHandling } from "@ove/ui-components";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import tex from "ace-builds/src-noconflict/mode-tex";
import css from "ace-builds/src-noconflict/mode-css";
import svg from "ace-builds/src-noconflict/mode-svg";
import html from "ace-builds/src-noconflict/mode-html";
import json from "ace-builds/src-noconflict/mode-json";
import text from "ace-builds/src-noconflict/mode-text";
import markdown from "ace-builds/src-noconflict/mode-markdown";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.setModuleUrl("ace/mode/json", json);
ace.config.setModuleUrl("ace/mode/markdown", markdown);
ace.config.setModuleUrl("ace/mode/tex", tex);
ace.config.setModuleUrl("ace/mode/html", html);
ace.config.setModuleUrl("ace/mode/text", text);
ace.config.setModuleUrl("ace/mode/css", css);
ace.config.setModuleUrl("ace/mode/svg", svg);

const LanguageSchema = z.union([z.literal("css"), z.literal("csv"), z.literal("html"), z.literal("json"), z.literal("latex"), z.literal("markdown"), z.literal("tsv")]);

export type Language = z.infer<typeof LanguageSchema>

const FormSchema = z.strictObject({
  language: LanguageSchema,
  name: z.string(),
  data: z.string()
});

type Form = z.infer<typeof FormSchema>

const getExtensionForLanguage = (language: Language) => {
  if (language === "latex") return ".tex";
  if (language === "markdown") return ".md";
  return `.${language}`;
};

const addFileExtension = (name: string, language: Language) => {
  const extension = getExtensionForLanguage(language);
  return `${name}${extension}`;
};

const languageToMode = (language: Language) =>
  language === "csv" || language === "tsv" ? "text" : language;

type FileEditorProps = {
  file: { data: string, language: Language } | null
  close: () => void
}

const FileEditor = ({ file, close }: FileEditorProps) => {
  const [data, setData] = useState(file?.data ?? "");
  const [language, setLanguage] =
    useState<Language>(file?.language ?? "markdown");
  const form = useForm<Form>({ resolver: zodResolver(FormSchema), defaultValues: { language } });
  useFormErrorHandling(form.formState.errors);
  const name = form.watch("name");
  const projectId = useProjectId();
  const uploadFile = useUpload(assert(projectId), { name: name ?? "ERROR" });

  const onSubmit = async ({name, data, language}: z.infer<typeof FormSchema>) => {
    if (name === "") return;
    await uploadFile(new File(data.split("\n"), addFileExtension(name, language), {type: "text/plain"}));
    close();
  };

  return <DialogContent hasClose={false}
    className="w-[80vw] aspect-video text-white gap-0 space-y-0 bg-transparent rounded-xl max-w-[unset] p-0 m-0">
    <DialogHeader
      className="rounded-t-xl text-white h-16 justify-center pl-4 bg-[#002147] space-y-0">
      <DialogTitle>File Editor</DialogTitle>
      <DialogDescription>Edit {language} file</DialogDescription>
      <DialogCloseX onClick={close}><X /></DialogCloseX>
    </DialogHeader>
    <AceEditor
      placeholder="File Contents"
      theme="dracula"
      mode={languageToMode(language)}
      name="custom-file"
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
        useWorker: false
      }}
    />
    <DialogFooter
      className="space-y-0 w-full rounded-b-xl bg-[#002147] h-16">
      <Form {...form}>
        <form className="flex flex-row items-center justify-end gap-x-2 mx-2 w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField name="language" control={form.control}
                     render={({field}) => <FormItem className="space-y-0">
                       <VisuallyHidden>
                       <FormLabel>Language</FormLabel>
                       </VisuallyHidden>
                       <Select {...field} onValueChange={v => setLanguage(v as Language)}>
                         <FormControl>
                           <SelectTrigger className="text-black bg-white">
                             <SelectValue placeholder="Select a language" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent position="popper">
                           <SelectItem value="css">CSS</SelectItem>
                           <SelectItem value="csv">CSV</SelectItem>
                           <SelectItem value="html">HTML</SelectItem>
                           <SelectItem value="json">JSON</SelectItem>
                           <SelectItem value="latex">Latex</SelectItem>
                           <SelectItem value="markdown">Markdown</SelectItem>
                           <SelectItem value="tsv">TSV</SelectItem>
                         </SelectContent>
                       </Select>
                     </FormItem>} />
          <FormField control={form.control} name="name" render={({field}) => <FormItem className="space-y-0">
            <VisuallyHidden><FormLabel className="font-bold">File Name</FormLabel></VisuallyHidden>
            <Input {...field} placeholder="Enter file name"
                   className="border-black border-solid border rounded text-black" />
          </FormItem>} />
          <Button variant="outline" className="text-black">
            <Save className="h-4 w-4 mr-1" />
            SAVE
          </Button>
        </form>
      </Form>
    </DialogFooter>
  </DialogContent>;
};

export default FileEditor;
