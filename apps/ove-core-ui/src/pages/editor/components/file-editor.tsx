import { z } from "zod";
import ace from "ace-builds";
import {
  Button,
  DialogCloseX,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  SelectValue,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import AceEditor from "react-ace";
import { Save, X } from "lucide-react";
import React from "react";
import { assert } from "@ove/ove-utils";
import { useForm, Controller } from "react-hook-form";
import { useUpload } from "../hooks/files";
import { useProjectId } from "../hooks/projects";
import { zodResolver } from "@hookform/resolvers/zod";
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

// TODO: review typecasts
ace.config.setModuleUrl("ace/mode/json", json as unknown as string);
ace.config.setModuleUrl("ace/mode/markdown", markdown as unknown as string);
ace.config.setModuleUrl("ace/mode/tex", tex as unknown as string);
ace.config.setModuleUrl("ace/mode/html", html as unknown as string);
ace.config.setModuleUrl("ace/mode/text", text as unknown as string);
ace.config.setModuleUrl("ace/mode/css", css as unknown as string);
ace.config.setModuleUrl("ace/mode/svg", svg as unknown as string);

const LanguageSchema = z.union([
  z.literal("css"),
  z.literal("csv"),
  z.literal("html"),
  z.literal("json"),
  z.literal("latex"),
  z.literal("markdown"),
  z.literal("tsv"),
]);

export type Language = z.infer<typeof LanguageSchema>;

const FormSchema = z.strictObject({
  language: LanguageSchema,
  name: z.string().trim().min(1, "Please enter a file name"),
  data: z.string().trim().min(1, "File cannot be empty"),
});

type TForm = z.infer<typeof FormSchema>;

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
  file: { data: string; language: Language } | null;
  close: () => void;
};

const FileEditor = ({ file, close }: FileEditorProps) => {
  const form = useForm<TForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: { language: file?.language ?? "markdown", data: file?.data ?? "", name: "" },
  });
  useFormErrorHandling(form.formState.errors);
  const name = form.watch("name");
  const language = form.watch("language");
  const fullName = name ? addFileExtension(name, language) : "ERROR";
  const projectId = useProjectId();
  const uploadFile = useUpload(assert(projectId));

  const onSubmit = async ({
    name,
    data,
    language,
  }: z.infer<typeof FormSchema>) => {
    if (name === "") return;
    await uploadFile({
      objectName: fullName,
      file: new File([data], fullName, { type: "text/plain" }),
    });
    close();
  };

  return (
    <DialogContent
      hasClose={false}
      className="m-0 aspect-video w-[80vw] max-w-[unset] gap-0 space-y-0 rounded-xl bg-transparent p-0 text-white"
    >
      <DialogHeader className="h-16 justify-center space-y-0 rounded-t-xl bg-[#002147] pl-4 text-white">
        <DialogTitle>File Editor</DialogTitle>
        <DialogDescription>Edit {language} file</DialogDescription>
        <DialogCloseX onClick={close}>
          <X />
        </DialogCloseX>
      </DialogHeader>
      <Controller
        name="data"
        control={form.control}
        render={({ field }) => (
          <AceEditor
            placeholder="File Contents"
            theme="dracula"
            mode={languageToMode(language)}
            name="custom-file"
            style={{ width: "100%", height: "calc(((80vw/16)*9) - 8rem)" }}
            value={field.value}
            onChange={field.onChange}
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={false}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
              useWorker: false,
            }}
          />
        )}
      />
      <DialogFooter className="h-16 w-full space-y-0 rounded-b-xl bg-[#002147]">
        <Form {...form}>
          <form
            className="mx-2 flex w-full flex-row items-center justify-end gap-x-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="language"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <VisuallyHidden>
                    <FormLabel>Language</FormLabel>
                  </VisuallyHidden>
                  <Select
                    onValueChange={(v) => field.onChange(v) }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white text-black">
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
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <VisuallyHidden>
                    <FormLabel className="font-bold">File Name</FormLabel>
                  </VisuallyHidden>
                  <Input
                    {...field}
                    placeholder="Enter file name"
                    className="rounded border border-solid border-black text-black"
                  />
                </FormItem>
              )}
            />
            <Button variant="outline" className="text-black" type="submit">
              <Save className="mr-1 size-4" />
              SAVE
            </Button>
          </form>
        </Form>
      </DialogFooter>
    </DialogContent>
  );
};

export default FileEditor;
