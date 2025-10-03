import {
  fromURL,
  getLatest,
  hasVersion,
  toURL,
  useFiles,
} from "../hooks/files";
import { z } from "zod";
import { type Control, useForm, type UseFormSetValue, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  Button,
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
import { assert } from "@ove/ove-utils";
import { useCells } from "../hooks/canvas";
import { useProjectId } from "../hooks/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Geometry as TGeometry, Observatory } from "../types";
import { useObservatory } from "../../../hooks/observatories";
import { Brush, Fullscreen, Grid } from "react-bootstrap-icons";
import { useSectionStore, useStateStore } from "../hooks/stores";
import { useSections, useUpdateSection } from "../hooks/sections";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";
import { Bounds, type DataType, dataTypes, type File } from "@ove/ove-types";

const getDataTypeFromFile = (file: File) => {
  for (const dt of dataTypes) {
    if (
      dt.extensions.some((extension) =>
        file.name.toLowerCase().endsWith(extension.toLowerCase()),
      )
    ) {
      return dt.name;
    }
  }
  return null;
};

const sort = (k: keyof DataType, a: DataType, b: DataType) => {
  if (a[k] > b[k]) return 1;
  if (a[k] === b[k]) return 0;
  return -1;
};

const toPercentage = (x: number) => parseFloat(`${x * 100}`.slice(0, 5));
const fromPercentage = (x: number) => parseFloat(x.toString()) / 100;

const getRow = (
  y: number,
  space: {
    bounds: Bounds | null;
    cells: TGeometry[] | null;
  },
) => {
  if (space.bounds === null || space.cells === null) return null;
  if (y === 0) return 0;
  if (y === 1) return space.bounds.rows;
  for (let i = 0; i < space.cells.length; i++) {
    if (space.cells[i].y === y * space.bounds.height) {
      return Math.floor(i / space.bounds.columns);
    }
  }

  return null;
};

const getColumn = (
  x: number,
  space: {
    bounds: Bounds | null;
    cells: TGeometry[] | null;
  },
) => {
  if (space.bounds === null || space.cells === null) return null;
  if (x === 0) return 0;
  if (x === 1) return space.bounds.columns;
  for (let i = 0; i < space.cells.length; i++) {
    if (space.cells[i].x === x * space.bounds.width) {
      return i % space.bounds.columns;
    }
  }

  return null;
};

const SectionConfigFormSchema = z.strictObject({
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
  fileName: z.string(),
  fileVersion: z.string(),
  rowFrom: z.number(),
  rowTo: z.number(),
  columnFrom: z.number(),
  columnTo: z.number(),
  dataType: z.string(),
  asset: z.string(),
}).superRefine((v, ctx) => {
  if (v.width < 1) ctx.addIssue({ path: ["width"], code: z.ZodIssueCode.custom, message: "Width must be > 0" });
  if (v.height < 1) ctx.addIssue({ path: ["height"], code: z.ZodIssueCode.custom, message: "Height must be > 0" });
  if (v.x < 0 || v.y < 0 || v.x > 100 || v.y > 100) {
    ctx.addIssue({ path: ["x"], code: z.ZodIssueCode.custom, message: "x/y must be in [0, 100]" });
  }
  if (v.x + v.width > 100) {
    ctx.addIssue({ path: ["width"], code: z.ZodIssueCode.custom, message: "x + width must be ≤ 100" });
  }
  if (v.y + v.height > 100) {
    ctx.addIssue({ path: ["height"], code: z.ZodIssueCode.custom, message: "y + height must be ≤ 100" });
  }
  if (v.rowFrom >= v.rowTo) {
    ctx.addIssue({ path: ["rowTo"], code: z.ZodIssueCode.custom, message: "rowTo must be > rowFrom" });
  }
  if (v.columnFrom >= v.columnTo) {
    ctx.addIssue({ path: ["columnTo"], code: z.ZodIssueCode.custom, message: "columnTo must be > columnFrom" });
  }
});

type SectionConfigForm = z.infer<typeof SectionConfigFormSchema>;

const SectionConfig = () => {
  const projectId = useProjectId();
  const state = useStateStore((state) => state.selectedState);
  const { getSections } = useSections();
  const sections = useMemo(() => getSections(state), [state, getSections]);
  const selected = useSectionStore((state) => state.selectedSection);
  const cells = useCells();
  const updateSection = useUpdateSection();
  const { bounds } = useObservatory();
  const { ordinary } = useFiles(projectId);
  const section = useMemo(
    () => sections.find((section) => section.id === selected) ?? null,
    [selected, sections],
  );
  const form = useForm<SectionConfigForm>({
    defaultValues: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rowFrom: 0,
      rowTo: bounds?.rows ?? 0,
      columnFrom: 0,
      columnTo: bounds?.columns ?? 0,
      asset: "",
      dataType: "",
      fileName: "",
      fileVersion: "",
    },
    resolver: zodResolver(SectionConfigFormSchema),
  });
  const { handleSubmit, setValue, resetField, watch } = form;
  useFormErrorHandling(form.formState.errors);
  const [mode, setMode] = useState<"custom" | "grid">("custom");
  const [fileName, fileVersion] = watch(["fileName", "fileVersion"]);

  useEffect(() => {
    if (section === null) {
      form.reset();
      return;
    }
    const space = { bounds, cells };
    const rowFrom = getRow(section.y, space);
    const colFrom = getColumn(section.x, space);
    const rowTo = getRow(section.y + section.height, space);
    const colTo = getColumn(section.x + section.width, space);
    setValue("x", toPercentage(section.x));
    setValue("y", toPercentage(section.y));
    setValue("width", toPercentage(section.width));
    setValue("height", toPercentage(section.height));
    setValue("rowFrom", rowFrom ?? 0);
    setValue("columnFrom", colFrom ?? 0);
    setValue("rowTo", rowTo ?? bounds?.rows ?? 0);
    setValue("columnTo", colTo ?? bounds?.columns ?? 0);
    setValue("dataType", section.dataType);
    setValue("asset", section.asset);
    const file = fromURL(ordinary, section.asset);
    if (file !== null) {
      setValue("fileName", `${file.bucketName}/${file.name}`);
      setValue("fileVersion", file.version.toString());
    }
  }, [
    section,
    selected,
    sections,
    resetField,
    setValue,
    bounds,
    cells,
    form,
    ordinary,
  ]);

  const onSubmit = (section: SectionConfigForm) => {
    if (mode === "grid" && (bounds === null || cells === null)) {
      toast.error("Please select an observatory");
      return;
    }
    if (section.asset === "" || section.dataType === "") {
      toast.error("Please enter an asset/data type");
      return;
    }
    updateSection({
      x:
        mode === "custom"
          ? fromPercentage(assert(section.x))
          : assert(section.columnFrom) / assert(bounds).columns,
      y:
        mode === "custom"
          ? fromPercentage(assert(section.y))
          : assert(section.rowFrom) / assert(bounds).rows,
      width:
        mode === "custom"
          ? fromPercentage(assert(section.width))
          : (assert(section.columnTo) - assert(section.columnFrom)) *
            (1 / assert(bounds).columns),
      height:
        mode === "custom"
          ? fromPercentage(assert(section.height))
          : (assert(section.rowTo) - assert(section.rowFrom)) *
            (1 / assert(bounds).rows),
      assetId:
        ordinary.find(
          ({ name, version }) =>
            name === section.fileName &&
            version.toString() === section.fileVersion,
        )?.name ?? null,
      asset: section.asset,
      dataType: section.dataType,
      states: [state],
      ordering:
        sections.find((section) => section.id === selected)?.ordering ??
        sections.length,
      projectId: assert(projectId),
    });

    form.reset();
  };

  const url = watch("asset");

  const onAssetChange = useCallback(
    (asset: string | undefined) => {
      const file = fromURL(ordinary, asset ?? "");
      setValue("fileVersion", file === null ? "" : file.version);
      setValue(
        "fileName",
        file === null ? "" : `${file.bucketName}/${file.name}`,
      );
      if (file !== null) {
        setValue("dataType", getDataTypeFromFile(file) ?? "");
      }
    },
    [setValue, ordinary],
  );

  useEffect(() => {
    onAssetChange(url);
  }, [url, onAssetChange]);

  useEffect(() => {
    if (fileName === "") return;
    const [bn, fn] = fileName.split("/");
    const fv =
      fileVersion === "" || !hasVersion(ordinary, bn, fn, fileVersion)
        ? getLatest(ordinary, bn, fn).version
        : fileVersion;
    setValue("asset", toURL(bn, fn, fv));
  }, [fileName, setValue, fileVersion, ordinary]);

  const isDisabled = section === null;

  return (
    <section className="h-full px-4">
      <h2 className="mt-2 w-full text-center text-base font-bold">
        Section Config
      </h2>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-row"
        >
          <div className="flex w-[calc(100%-2.5rem)] flex-col">
            <Geometry
              setMode={setMode}
              mode={mode}
              space={bounds}
              setValue={setValue}
              control={form.control}
              isDisabled={isDisabled}
            />
          </div>
          <fieldset className="flex w-[66%] flex-col" disabled={isDisabled}>
            <FormField
              control={form.control}
              name="asset"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-semibold">Asset</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <S3FileSelect
              control={form.control}
              fileName={fileName}
              files={ordinary}
            />
            <FormField
              control={form.control}
              name="dataType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-semibold">Data Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper">
                      {dataTypes
                        .sort((a, b) => sort("displayName", a, b))
                        .map(({ displayName, name }) => (
                          <SelectItem value={name} key={name}>
                            {displayName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <div className="mt-2 flex w-full flex-col">
              <Button variant="default" className="w-full" type="submit">
                UPDATE
              </Button>
            </div>
          </fieldset>
        </form>
      </Form>
    </section>
  );
};

const Geometry = ({
  mode,
  control,
  setMode,
  setValue,
  space,
  isDisabled
}: {
  mode: "custom" | "grid";
  setMode: (mode: "custom" | "grid") => void;
  setValue: UseFormSetValue<SectionConfigForm>;
  space: Observatory | null;
  control: Control<SectionConfigForm>;
  isDisabled: boolean;
}) => {
  const [x, y, width, height, rowFrom, rowTo, columnFrom, columnTo] = useWatch({ 
    control, name: ["x", "y", "width", "height", "rowFrom", "rowTo", "columnFrom", "columnTo"] 
  });

  const maxRowFrom = rowTo <= 0 ? 0 : rowTo - 1
  const minRowTo = (space?.rows && rowFrom >= space.rows) ? rowFrom : (rowFrom ?? -1) + 1
  const maxColFrom = columnTo <= 0 ? 0 : columnTo - 1
  const minColTo = (space?.columns && columnFrom >= space.columns) ? columnFrom : (columnFrom ?? -1) + 1

  const fullscreen = () => {
    setValue("x", 0);
    setValue("y", 0);
    setValue("width", 100);
    setValue("height", 100);
    setValue("columnFrom", 0);
    setValue("columnTo", space?.columns ?? 0);
    setValue("rowFrom", 0);
    setValue("rowTo", space?.rows ?? 0);
  };

  return (
    <div className="w-[calc((100%-2rem)-0.5rem)]">
      <div className="flex w-full flex-row">
        <div className="mt-2 flex w-full flex-row items-center">
          <Button
            className="rounded-r-none"
            type="button"
            variant={mode === "custom" ? "default" : "outline"}
            onClick={() => setMode("custom")}
            disabled={isDisabled}
          >
            <Brush className="mr-1" /> Custom
          </Button>
          <Button
            className="rounded-l-none"
            variant={mode === "grid" ? "default" : "outline"}
            type="button"
            onClick={() => setMode("grid")}
            disabled={isDisabled}
          >
            <Grid className="mr-1" /> Grid
          </Button>
        </div>
        <Button className="mt-2" type="button" onClick={fullscreen} disabled={isDisabled}>
          <Fullscreen className="mr-1" /> Maximise
        </Button>
      </div>
      <fieldset
        className="grid w-full grid-cols-[1fr,1fr] gap-x-6 p-0"
        style={mode === "custom" ? undefined : { display: "none" }}
        disabled={isDisabled}
      >
        <FormField
          control={control}
          name="x"
          render={({ field }) => (
            <FormItem className="w-full space-y-1">
              <FormLabel className="font-semibold">x</FormLabel>
              <div className="relative flex w-full">
                <FormControl className="w-full">
                  <Input {...field} type="number" className="relative pr-5" step="any" min={0} max={100 - (width ?? 0)} onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)} />
                </FormControl>
                <span className="absolute right-1 top-2">%</span>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="y"
          render={({ field }) => (
            <FormItem className="w-full space-y-1">
              <FormLabel className="font-semibold">y</FormLabel>
              <div className="relative flex w-full items-center">
                <FormControl className="w-full">
                  <Input {...field} type="number" className="relative pr-5" step="any" min={0} max={100 - (height ?? 0)} onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)} />
                </FormControl>
                <span className="absolute right-1 top-2">%</span>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="width"
          render={({ field }) => (
            <FormItem className="w-full space-y-1">
              <FormLabel className="font-semibold">Width</FormLabel>
              <div className="relative flex w-full items-center">
                <FormControl className="w-full">
                  <Input {...field} type="number" className="relative pr-5" step="any" min={1}  max={100 - (x ?? 0)} onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)} />
                </FormControl>
                <span className="absolute right-1 top-2">%</span>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="height"
          render={({ field }) => (
            <FormItem className="w-full space-y-1">
              <FormLabel className="font-semibold">Height</FormLabel>
              <div className="relative flex w-full items-center">
                <FormControl className="w-full">
                  <Input {...field} type="number" className="relative pr-5" step="any" min={1}  max={100 - (y ?? 0)} onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)} />
                </FormControl>
                <span className="absolute right-1 top-2">%</span>
              </div>
            </FormItem>
          )}
        />
      </fieldset>
      <fieldset
        className="grid w-full grid-cols-[1fr,1fr] gap-x-6 p-0"
        style={mode === "grid" ? undefined : { display: "none" }}
      >
        <FormField
          control={control}
          name="rowFrom"
          render={({ field }) => (
            <FormItem className="w-full space-y-1">
              <FormLabel className="font-semibold">From Row</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={0} max={maxRowFrom} onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="rowTo"
          render={({ field }) => (
            <FormItem className="w-full space-y-1">
              <FormLabel className="font-semibold">To Row</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={minRowTo} max={space?.rows ?? 0} onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="columnFrom"
          render={({ field }) => (
            <FormItem className="w-full space-y-1">
              <FormLabel className="font-semibold">From Column</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={0} max={maxColFrom} onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="columnTo"
          render={({ field }) => (
            <FormItem className="w-full space-y-1">
              <FormLabel className="font-semibold">To Column</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={minColTo} max={space?.columns ?? 0} onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}/>
              </FormControl>
            </FormItem>
          )}
        />
      </fieldset>
    </div>
  );
};

export default SectionConfig;
