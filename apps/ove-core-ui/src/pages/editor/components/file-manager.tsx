import { z } from "zod";
import { toast } from "sonner";
import {
  Badge,
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  useFormErrorHandling
} from "@ove/ui-base-components";
import { assert } from "@ove/ove-utils";
import { useForm } from "react-hook-form";
import { useProjectId } from "../hooks/projects";
import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { File as FileT } from "@ove/ove-types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getLatest, toURL, useFiles, useUpload } from "../hooks/files";
import { usePartialUpdateSection } from "../hooks/sections";
import { Brush, Check, Upload as UploadButton, X } from "lucide-react";
import { api } from "../../../utils/api";

const Version = ({
  file,
  version,
  closeDialog,
}: {
  closeDialog: () => void;
  file: FileT;
  version: string;
}) => {
  const convertedFiles = [
    "png",
    "jpg",
    "jpeg",
    "tiff",
    "tif",
    "webp",
    "md",
    "markdown",
    "latex",
    "tex",
  ];
  const getConversionStatus = api.projects.getConversionStatus.useQuery(
    {
      bucketName: file.bucketName,
      objectName: file.name,
      versionId: version,
    },
    {
      enabled:
        version !== "latest" &&
        convertedFiles.includes(
          file.name.split(".").at(-1)?.toLowerCase() ?? "",
        ),
    },
  );
  const partialUpdateSection = usePartialUpdateSection();
  return (
    <DropdownMenuItem
      key={version}
      onClick={() => {
        partialUpdateSection({
          asset: toURL(file.bucketName, file.name, version),
        });
        closeDialog();
      }}
    >
      {version}
      {version !== "latest" && getConversionStatus.data !== undefined ? (
        <Badge className="rounded-circle" variant={getConversionStatus.data ? "green" : "red"}>{getConversionStatus.data ? <Check /> : <X />}</Badge>
      ) : null}
    </DropdownMenuItem>
  );
};

const FileView = ({
  file,
  files,
  edit,
  closeDialog,
}: {
  files: FileT[];
  file: FileT;
  edit: (file: FileT | null) => void;
  closeDialog: () => void;
}) => {
  const latestFile = getLatest(files, file.bucketName, file.name);

  const canEdit = (name: string) => {
    const editableExtensions = [
      "css",
      "csv",
      "html",
      "json",
      "md",
      "markdown",
      "tex",
      "tsv",
    ];
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    return editableExtensions.includes(ext);
  };

  return (
    <li className="mt-2 flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow">
      <div className="mr-2 flex min-w-0 items-center space-x-4">
        <div className="scrollbar-hide max-w-[40vw] overflow-x-auto whitespace-nowrap">
          <p className="font-medium text-black">{file.name}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {canEdit(latestFile.name) && (
          <Button onClick={() => edit(latestFile)}>Edit</Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm">
              Select
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {files
              .filter(
                (f) => f.name === file.name && f.bucketName === file.bucketName,
              )
              .map(({ version }) => (
                <Version
                  file={file}
                  version={version}
                  closeDialog={closeDialog}
                />
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
};

export const FileUploadFormSchema = z.strictObject({
  file: z.union([z.custom<File>().array(), z.custom<File>()]),
});

export type FileUploadForm = z.infer<typeof FileUploadFormSchema>;

type FileManagerProps = {
  edit: (file: FileT | null) => void;
  closeDialog: () => void;
};

const FileManager = ({ edit, closeDialog }: FileManagerProps) => {
  const projectId = useProjectId();
  const { ordinary } = useFiles(assert(projectId));
  const form = useForm<FileUploadForm>({
    resolver: zodResolver(FileUploadFormSchema),
  });
  const [fileInputKey, setFileInputKey] = useState(0);
  const uploadFile = useUpload(assert(projectId));
  useFormErrorHandling(form.formState.errors);
  const groupedFiles = useMemo(
    () =>
      Object.entries(Object.groupBy(ordinary, (file) => file.bucketName)).map(
        ([label, group]) =>
          [
            label,
            (group ?? []).filter(
              (f, i, arr) => arr.findIndex((x) => x.name === f.name) === i,
            ),
          ] as const,
      ),
    [ordinary],
  );

  const onSubmit = async ({ file }: FileUploadForm) => {
    const selected = Array.isArray(file) ? file[0] : file;
    if (!selected) {
      toast.error("No file selected");
      return;
    }
    const handler = uploadFile({
      objectName: selected.name,
      file: selected,
      intent: "auto",
    }).then(() => {
      form.reset();
      setFileInputKey((k) => k + 1);
    });
    toast.promise(
      handler,
      {
        loading: "Uploading file",
        success: "File uploaded",
        error: "Failed to upload file",
      },
    );


  };
  const { files } = useFiles(assert(projectId));

  return (
    <DialogContent className="flex flex-col">
      <DialogHeader>
        <DialogTitle>Project Files</DialogTitle>
        <DialogDescription>
          View and upload files for use in the project
        </DialogDescription>
      </DialogHeader>
      <ul className="flex h-[40vh] w-full flex-col items-center overflow-y-scroll">
        {groupedFiles.map(([label, group]) => (
          <div key={label} className="w-full">
            <h6 className="w-full text-start font-semibold">Bucket: {label}</h6>
            {group.map((file) => (
              <FileView
                key={toURL(file.bucketName, file.name, file.version)}
                file={file}
                files={files}
                edit={edit}
                closeDialog={closeDialog}
              />
            ))}
          </div>
        ))}
      </ul>
      <DialogFooter className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-auto flex w-full flex-col items-center gap-1 rounded-xl border border-solid border-black p-2"
          >
            <h6 className="font-semibold">Create or upload a file</h6>
            <div className="flex h-full flex-row items-center gap-2">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value: _value, ...rest } }) => (
                  <FormItem className="space-y-0">
                    <VisuallyHidden>
                      <FormLabel className="font-bold" htmlFor="file">
                        New File
                      </FormLabel>
                    </VisuallyHidden>
                    <FormControl>
                      <Input
                        className="cursor-pointer"
                        required={true}
                        type="file"
                        key={fileInputKey}
                        {...rest}
                        onChange={(e) => {
                          const files = e.target.files;
                          rest.onChange(
                            files && files.length ? files[0] : undefined,
                          );
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button variant="outline" type="submit">
                <UploadButton className="mr-1 size-4" />
                Upload
              </Button>
              <Button
                variant="default"
                className="ml-auto mr-1 px-3 text-white"
                onClick={() => edit(null)}
                type="button"
              >
                <Brush className="mr-1 size-4" />
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogFooter>
    </DialogContent>
  );
};

export default FileManager;
