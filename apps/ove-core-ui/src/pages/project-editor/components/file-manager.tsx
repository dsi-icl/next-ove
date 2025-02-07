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
  SelectValue
} from "@ove/ui-base-components";
import { env } from "../../../env";
import { assert } from "@ove/ove-utils";
import { api } from "../../../utils/api";
import { useForm } from "react-hook-form";
import { useProjectId } from "../hooks/projects";
import React, { useMemo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { dataTypes, File as FileT } from "@ove/ove-types";
import { useFormErrorHandling } from "@ove/ui-components";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getLatest, toURL, useFiles, useUpload } from "../hooks/files";
import { Brush, Gear, Upload as UploadButton } from "react-bootstrap-icons";

const FileView = ({ file, files }: {
  files: FileT[],
  file: FileT
}) => {
  const isImage = file.name
    .match(env.CONSTANTS.IMAGE_EXTENSION_REGEX) !== null;
  const dataType = dataTypes.find(dt => dt.extensions.includes(file.name.split(".").at(-1) ?? "markdown")) ?? dataTypes[0];
  const processImage = api.projects.formatDZI.useMutation({ retry: false });
  const process = useCallback(() => processImage.mutateAsync({
      bucketName: file.bucketName,
      objectName: file.name,
      versionId: getLatest(files, file.bucketName, file.name).version
    })
      .then(() => toast.success(`Converted ${file.name} to DZI`))
      .catch(() => toast.error(`Error converting ${file.name} to DZI`)),
    [processImage, files, file.name, file.bucketName]);

  return <li
      className="w-full max-h-[30vh] overflow-y-scroll flex mt-2 items-center justify-between p-4 bg-white border-gray-100 border rounded-lg shadow">
    <div className="flex items-center space-x-4">
      <div>
        <p
          className="text-black font-medium overflow-hidden text-nowrap text-ellipsis">{file.name}</p>
        <p
          className="text-sm text-gray-500">{dataType.displayName}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      {isImage ? <Button variant="ghost" type="button" title="process asset"
              onClick={() => process()}>
        <Gear className="w-4 h-4" />
      </Button> : null}
      {/* @ts-expect-error - readOnly prop is not known on type */}
      <Select readOnly={true} value={getLatest(files, file.bucketName, file.name).version}>
        <SelectTrigger className="text-black"><SelectValue /></SelectTrigger>
        <SelectContent position="popper">
          {files.filter(f => f.name === file.name && f.bucketName === file.bucketName).map(({version}) => version).map(version => <SelectItem className="w-fit" value={version} key={version} disabled={true}>{version}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  </li>;
};

export const FileUploadFormSchema = z.strictObject({
  file: z.union([z.custom<File>().array(), z.custom<File>()])
});

export type FileUploadForm = z.infer<typeof FileUploadFormSchema>

type FileManagerProps = {
  edit: (file: FileT | null) => void
}

const FileManager = ({ edit }: FileManagerProps) => {
  const projectId = useProjectId();
  const { ordinary } = useFiles(assert(projectId));
  const form =
    useForm<FileUploadForm>({
      resolver: zodResolver(FileUploadFormSchema)
    });
  const file = form.watch("file");
  const uploadFile = useUpload(assert(projectId), { name: (Array.isArray(file) ? file?.[0]?.name : file?.name) ?? "ERROR" });
  useFormErrorHandling(form.formState.errors);
  const groupedFiles = useMemo(() => Object.entries(Object.groupBy(ordinary, file => file.bucketName)).map(([label, group]) => [label, (group ?? []).filter((f, i, arr) => arr.findIndex(x => x.name === f.name) === i)] as const), [ordinary]);

  const onSubmit = ({ file }: FileUploadForm) => {
    uploadFile(Array.isArray(file) ? file[0] : file).catch(console.error);
    form.reset();
  };
  const { files } = useFiles(assert(projectId));

  return <DialogContent className="flex flex-col">
    <DialogHeader>
      <DialogTitle>Project Files</DialogTitle>
      <DialogDescription>View and upload files for use in the
        project</DialogDescription>
    </DialogHeader>
    <ul
      className="w-full flex flex-col items-center overflow-y-scroll h-[40vh]">
      {groupedFiles.map(([label, group]) => <>
        <h6 className="font-semibold text-start w-full">Bucket: {label}</h6>
        {group.map(file => <FileView key={toURL(file.bucketName, file.name, file.version)} file={file} files={files} />)}
      </>)}
    </ul>
    <DialogFooter className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex flex-col items-center gap-1 mt-auto border border-solid border-black rounded-xl p-2">
          <h6 className="font-semibold">Create or upload a file</h6>
          <div className="flex flex-row h-full items-center gap-2">
          <FormField control={form.control} name="file"
                     render={({ field: { value, ...rest } }) => <FormItem className="space-y-0">
                       <VisuallyHidden><FormLabel className="font-bold"
                                                  htmlFor="file">New
                         File</FormLabel></VisuallyHidden>
                       <FormControl><Input className="cursor-pointer" required={true}
                                           type="file" {...rest} /></FormControl>
                     </FormItem>} />
          <Button variant="outline"
                  type="submit"><UploadButton className="h-4 w-4 mr-1" />Upload</Button>
            <Button variant="default"
                    className="text-white ml-auto mr-1 px-3"
                    onClick={() => edit(null)} type="button"><Brush className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>
        </form>
      </Form>
    </DialogFooter>
  </DialogContent>;
};

export default FileManager;
