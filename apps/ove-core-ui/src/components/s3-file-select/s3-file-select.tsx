import type { File } from "@ove/ove-types";
import type { Control, FieldValues, Path } from "react-hook-form";
import React, { useMemo } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ove/ui-base-components";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type S3FileSelectProps<T extends FieldValues> = {
  id?: string;
  disabled?: boolean;
  files: File[];
  control: Control<T>;
  fileName: string | null | undefined;
};

const S3FileSelect = <T extends FieldValues>({
  id,
  disabled,
  files,
  control,
  fileName,
}: S3FileSelectProps<T>) => {
  const filteredFiles = useMemo(
    () =>
      (files ?? [])
        .map(({ bucketName, name }) => `${bucketName}/${name}`)
        .filter((name, i, arr) => arr.indexOf(name) === i),
    [files],
  );
  const fileVersions = useMemo(
    () =>
      (files ?? [])
        .filter((file) => `${file.bucketName}/${file.name}` === fileName)
        .map(({ version }) => version),
    [files, fileName],
  );

  return (
    <div id={id} className="flex w-full">
      <FormField
        control={control}
        name={"fileName" as Path<T>}
        render={({ field }) => (
          <FormItem className="w-3/5">
            <VisuallyHidden>
              <FormLabel className="font-semibold">File Name:</FormLabel>
            </VisuallyHidden>
            <Select 
              disabled={disabled ?? false}  
              value={field.value ?? ""}
              onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a file" />
                </SelectTrigger>
              </FormControl>
              <SelectContent position="popper">
                {filteredFiles.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <FormField
        name={"fileVersion" as Path<T>}
        render={({ field }) => (
          <FormItem className="w-2/5">
            <VisuallyHidden>
              <FormLabel className="font-semibold">File Version:</FormLabel>
            </VisuallyHidden>
            <Select
              disabled={disabled ?? false} 
              value={field.value ?? ""}
              onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a version" />
                </SelectTrigger>
              </FormControl>
              <SelectContent position="popper">
                {fileVersions.map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </div>
  );
};

export default S3FileSelect;
