import { z } from "zod";
import { toast } from "sonner";
import {
  Button,
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
  SelectTrigger,
  SelectItem,
  SelectValue,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import { env } from "../../../env";
import { assert } from "@ove/ove-utils";
import { api } from "../../../utils/api";
import { useForm } from "react-hook-form";
import { useProjectId } from "../hooks/projects";
import React, { useMemo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { dataTypes, File as FileT } from "@ove/ove-types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getLatest, toURL, useFiles, useUpload } from "../hooks/files";
import { Brush, Gear, Upload as UploadButton } from "react-bootstrap-icons";

const FileView = ({ file, files }: { files: FileT[]; file: FileT }) => {
  const isImage = file.name.match(env.CONSTANTS.IMAGE_EXTENSION_REGEX) !== null;
  const dataType =
    dataTypes.find((dt) =>
      dt.extensions.includes(file.name.split(".").at(-1) ?? "markdown"),
    ) ?? dataTypes[0];
  const processImage = api.projects.formatDZI.useMutation({ retry: false });
  const process = useCallback(
    () =>
      processImage
        .mutateAsync({
          bucketName: file.bucketName,
          objectName: file.name,
          versionId: getLatest(files, file.bucketName, file.name).version,
        })
        .then(() => toast.success(`Converted ${file.name} to DZI`))
        .catch(() => toast.error(`Error converting ${file.name} to DZI`)),
    [processImage, files, file.name, file.bucketName],
  );

  return (
    <li className="mt-2 flex max-h-[30vh] w-full items-center justify-between overflow-y-scroll rounded-lg border border-gray-100 bg-white p-4 shadow">
      <div className="flex items-center space-x-4">
        <div>
          <p className="overflow-hidden text-ellipsis text-nowrap font-medium text-black">
            {file.name}
          </p>
          <p className="text-sm text-gray-500">{dataType.displayName}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isImage ? (
          <Button
            variant="ghost"
            type="button"
            title="process asset"
            onClick={() => process()}
          >
            <Gear className="size-4" />
          </Button>
        ) : null}
        <Select
          // @ts-expect-error - read only prop not recognized
          readOnly={true}
          value={getLatest(files, file.bucketName, file.name).version}
        >
          <SelectTrigger className="text-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {files
              .filter(
                (f) => f.name === file.name && f.bucketName === file.bucketName,
              )
              .map(({ version }) => version)
              .map((version) => (
                <SelectItem
                  className="w-fit"
                  value={version}
                  key={version}
                  disabled={true}
                >
                  {version}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
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
};

const FileManager = ({ edit }: FileManagerProps) => {
  const projectId = useProjectId();
  const { ordinary } = useFiles(assert(projectId));
  const form = useForm<FileUploadForm>({
    resolver: zodResolver(FileUploadFormSchema),
  });
  const file = form.watch("file");
  const uploadFile = useUpload(assert(projectId), {
    name: (Array.isArray(file) ? file?.[0]?.name : file?.name) ?? "ERROR",
  });
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

  const onSubmit = ({ file }: FileUploadForm) => {
    uploadFile(Array.isArray(file) ? file[0] : file).catch(console.error);
    form.reset();
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
                        {...rest}
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
