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
import { useEffect, useRef } from "react";
import { assert } from "@ove/ove-utils";
import { useForm, Controller } from "react-hook-form";
import { useUpload } from "../hooks/files";
import { useProjectId } from "../hooks/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';

import "tinymce/tinymce";
import "tinymce/models/dom";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/code";
import "tinymce/skins/ui/oxide/skin.min.css";

import tex from "ace-builds/src-noconflict/mode-tex";
import css from "ace-builds/src-noconflict/mode-css";
import svg from "ace-builds/src-noconflict/mode-svg";
import html from "ace-builds/src-noconflict/mode-html";
import json from "ace-builds/src-noconflict/mode-json";
import text from "ace-builds/src-noconflict/mode-text";
import markdown from "ace-builds/src-noconflict/mode-markdown";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import { toast } from "sonner";

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
  z.literal("richtext"),
]);

export type Language = z.infer<typeof LanguageSchema>;
type Mode = "create" | "edit";

const FormSchema = z.strictObject({
  language: LanguageSchema,
  name: z.string().trim().min(1, "Missing file name"),
  data: z.string().trim().min(1, "File cannot be empty"),
});

type TForm = z.infer<typeof FormSchema>;

const getExtensionForLanguage = (language: Language) => {
  if (language === "latex") return ".tex";
  if (language === "markdown") return ".md";
  if (language === "richtext") return ".html";
  return `.${language}`;
};

const addFileExtension = (name: string, language: Language) => {
  const extension = getExtensionForLanguage(language);
  return name.endsWith(extension) ? name : `${name}${extension}`;
};

const languageToMode = (language: Language) =>
  language === "csv" || language === "tsv" || language === "richtext" ? "text" : language;

const languageFromFilename = (name?: string): Language => {
  const ext = (name?.split(".").pop() ?? "").trim();
  if (ext === "md") return "markdown";
  if (ext === "tex") return "latex";
  return `${ext}` as Language;
};

type FileEditorProps = {
  file: { data: string; language: Language; name: string } | null;
  close: () => void;
};

const FileEditor = ({ file, close }: FileEditorProps) => {
  const mode: Mode = file ? "edit" : "create";

  const form = useForm<TForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: { 
      language: file ? languageFromFilename(file.name) : "richtext",
      data: file?.data ?? "", 
      name: mode === "edit" && file ? file.name.split(".").slice(0,-1).join(".") : "",
    }
  });
  useFormErrorHandling(form.formState.errors);
  const name = form.watch("name");
  const language = form.watch("language");
  const fullName = name ? addFileExtension(name, language) : "ERROR";
  const projectId = useProjectId();
  const uploadFile = useUpload(assert(projectId));
  const initialHtmlRef = useRef<string>(form.getValues("data") ?? "");
  const richTextDialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mode === "edit" && file) {
      form.setValue("data", file.data, { shouldDirty: false });
      form.setValue(
        "language", 
        file.data.includes("editor: richtext") ? "richtext" : languageFromFilename(file.name), 
        { shouldDirty: false }
      );
      form.setValue("name", file.name.split(".").slice(0,-1).join("."), { shouldDirty: false });
      initialHtmlRef.current = file.data;
    }
  }, [mode, file?.data, file?.name]);

  const richTextHtml = (
    content: string,
    editorWidth: number = 1920,
    editorHeight: number = 1080,
  ) => {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body { margin: 0; padding: 0; }
  html {
    font-size: min(
      calc(100vw * 16 / ${editorWidth}),
      calc(100vh * 16 / ${editorHeight})
    );
  }
</style>
</head>
<body>
<!-- editor: richtext -->
${content}
</body>
</html>`;
  }

  const onSubmit = async ({
    name,
    data,
    language,
  }: z.infer<typeof FormSchema>) => {
    if (name === "") return toast.error("Missing file name");

    if (language === "richtext") {
      data = richTextHtml(data, richTextDialogRef.current?.clientWidth, richTextDialogRef.current?.clientHeight);
    }

    const ok = await uploadFile({
      objectName: fullName,
      file: new File([data], fullName, { type: getExtensionForLanguage(language) === ".html" ? "text/html" : "text/plain" }),
      intent: mode === "edit" ? "update" : "create"
    });
    if (ok) close();
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
      {language === "richtext" ?
        <TinyMCEEditor
          licenseKey="gpl"
          onInit={
            (evt, editor) => { 
              richTextDialogRef.current = editor.getContainer(); 
            }
          }
          init={{
            height: "calc(((80vw/16)*9) - 8rem)",
            menubar: false,
            statusbar: false,
            promotion: false,
            plugins: "lists",
            custom_colors: false,
            toolbar:
              "undo redo | fontfamily blocks fontsize increaseFont decreaseFont | bold italic forecolor backcolor | bullist numlist",
            font_size_formats: "1rem 1.5rem 2rem 3rem 4rem 5rem 6rem 8rem 10rem 12rem 15rem",
            content_style: `
              @font-face {
                font-family: "Imperial Sans Display";
                src: url("https://do-store.dsi.ic.ac.uk/fonts/ImperialSansDisplay/ImperialSansDisplay-Extralight.woff2") format("woff2");
                font-weight: 200;
              }

              @font-face {
                font-family: "Imperial Sans Display";
                src: url("https://do-store.dsi.ic.ac.uk/fonts/ImperialSansDisplay/ImperialSansDisplay-Light.woff2") format("woff2");
                font-weight: 300;
              }

              @font-face {
                font-family: "Imperial Sans Display";
                src: url("https://do-store.dsi.ic.ac.uk/fonts/ImperialSansDisplay/ImperialSansDisplay-Regular.woff2") format("woff2");
                font-weight: 400;
              }

              @font-face {
                font-family: "Imperial Sans Display";
                src: url("https://do-store.dsi.ic.ac.uk/fonts/ImperialSansDisplay/ImperialSansDisplay-Medium.woff2") format("woff2");
                font-weight: 500;
              }

              @font-face {
                font-family: "Imperial Sans Display";
                src: url("https://do-store.dsi.ic.ac.uk/fonts/ImperialSansDisplay/ImperialSansDisplay-Semibold.woff2") format("woff2");
                font-weight: 600;
              }

              @font-face {
                font-family: "Imperial Sans Display";
                src: url("https://do-store.dsi.ic.ac.uk/fonts/ImperialSansDisplay/ImperialSansDisplay-Bold.woff2") format("woff2");
                font-weight: 700;
              }

              @font-face {
                font-family: "Imperial Sans Display";
                src: url("https://do-store.dsi.ic.ac.uk/fonts/ImperialSansDisplay/ImperialSansDisplay-Extrabold.woff2") format("woff2");
                font-weight: 800;
              }

              html { font-size: 16px; }
              body { font-size: 1rem; line-height: 1; font-family: 'Imperial Sans Display', sans-serif;}

              h1 { font-size: 15rem; font-weight: 800; }
              h2 { font-size: 12rem; font-weight: 700; }
              h3 { font-size: 10rem; font-weight: 600; }
              h4 { font-size: 8rem; font-weight: 500; }
              h5 { font-size: 6rem; font-weight: 400; }
              h6 { font-size: 5rem; font-weight: 300; }
              p  { font-size: 2rem; font-weight: 200; }
            `,
            setup: (editor) => {
              editor.on('PreInit', () => {
                editor.getBody().style.fontSize = '1rem';
              });
              editor.ui.registry.addButton('increaseFont', {
                text: 'A+',
                onAction: () => {
                  const currFontSize = editor.queryCommandValue('FontSize');
                  const newFontSize = (parseFloat(currFontSize.replace('rem', '')) + 0.25).toFixed(2);
                  editor.execCommand('FontSize', false, `${newFontSize}rem`);
                }
              });
              editor.ui.registry.addButton('decreaseFont', {
                text: 'A-',
                onAction: () => {                         
                  const currFontSize = editor.queryCommandValue('FontSize');
                  const newFontSize = (parseFloat(currFontSize.replace('rem', '')) - 0.25).toFixed(2);
                  editor.execCommand('FontSize', false, `${newFontSize}rem`);
                }
              });
            },
            ui_mode: "split", 
            font_family_formats: `
              Imperial Sans Display='Imperial Sans Display', sans-serif;
              Andale Mono=andale mono,times; 
              Arial=arial,helvetica,sans-serif; 
              Arial Black=arial black,avant garde; 
              Book Antiqua=book antiqua,palatino; 
              Comic Sans MS=comic sans ms,sans-serif; 
              Courier New=courier new,courier; 
              Georgia=georgia,palatino; 
              Helvetica=helvetica; 
              Impact=impact,chicago; 
              Symbol=symbol; 
              Tahoma=tahoma,arial,helvetica,sans-serif; 
              Terminal=terminal,monaco; 
              Times New Roman=times new roman,times; 
              Trebuchet MS=trebuchet ms,geneva; 
              Verdana=verdana,geneva; 
              Webdings=webdings; 
              Wingdings=wingdings,zapf dingbats;
            `.trim()
          }}
          initialValue={initialHtmlRef.current}
          onEditorChange={(content) =>
            form.setValue("data", content, { shouldDirty: true })
          }
        />
        :
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
      }
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
                    value={field.value as Language}
                    disabled={mode === "edit"}
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
                      <SelectItem value="richtext">Rich Text</SelectItem>
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
                    value={field.value}
                    className="rounded border border-solid border-black text-black"
                    disabled={mode === "edit"}
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
