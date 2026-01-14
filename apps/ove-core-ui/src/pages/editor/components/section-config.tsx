import {
  fromURL,
  useFiles,
} from "../hooks/files";
import { z } from "zod";
import { type Control, useForm, type UseFormSetValue, useWatch } from "react-hook-form";
import { Upload } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import { useCells } from "../hooks/canvas";
import { useProjectId } from "../hooks/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Geometry as TGeometry, Observatory } from "../types";
import { useObservatory } from "../../../hooks/observatories";
import { Brush, Fullscreen, Grid } from "react-bootstrap-icons";
import { useSectionStore, useStateStore } from "../hooks/stores";
import { usePartialUpdateSection, useSections } from "../hooks/sections";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { type Bounds, dataTypes, type File } from "@ove/ove-types";
import { TActions } from "../hooks/dialog";
import { toast } from "sonner";
import { env } from "../../../env";

const detectDataType = (asset: string | undefined, ordinary: File[]): string | null => {
  if (!asset) return null;

  try {
    const file = fromURL(ordinary, asset);
    const url = new URL(asset, typeof window !== "undefined" ? window.location.origin : "https://dummy.base");
    const path = (file ? file.name : url.pathname).toLowerCase();

    for (const dt of dataTypes) {
      if (dt.extensions.some(ext => path.endsWith(ext.toLowerCase()))) {
        return dt.name;
      }
    }
  } catch {
    // not a valid URL; fall through and return null
  }

  return "html";
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
    ctx.addIssue({ path: ["x", "y"], code: z.ZodIssueCode.custom, message: "x/y must be in [0, 100]" });
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

const SectionConfig = ({ setAction, openDialog }: 
  { 
    setAction: (action: TActions | null) => void, 
    openDialog: () => void 
  }) => {
  const projectId = useProjectId();
  const state = useStateStore((state) => state.selectedState);
  const { getSections } = useSections();
  const sections = useMemo(() => getSections(state), [state, getSections]);
  const selected = useSectionStore((state) => state.selectedSection);
  const preview = useSectionStore((state) => state.previewPos);
  const cells = useCells();
  const partialUpdateSection = usePartialUpdateSection();
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
  const { setValue, resetField } = form;
  useFormErrorHandling(form.formState.errors);
  const mode = useSectionStore((store) => store.configMode);
  const setMode = useSectionStore((store) => store.setConfigMode);

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

  useEffect(() => {
    if (!preview) return;
    if (preview.id !== selected) return;

    setValue("x", preview.xPct, { shouldValidate: false, shouldDirty: true, shouldTouch: false });
    setValue("y", preview.yPct, { shouldValidate: false, shouldDirty: true, shouldTouch: false });
    setValue("width", preview.wPct, { shouldValidate: false, shouldDirty: true, shouldTouch: false });
    setValue("height", preview.hPct, { shouldValidate: false, shouldDirty: true, shouldTouch: false });

    setValue("rowFrom", preview.yGrid, { shouldValidate: false, shouldDirty: true, shouldTouch: false });
    setValue("columnFrom", preview.xGrid, { shouldValidate: false, shouldDirty: true, shouldTouch: false });
    setValue("rowTo", preview.yGrid + preview.hGrid, { shouldValidate: false, shouldDirty: true, shouldTouch: false });
    setValue("columnTo", preview.xGrid + preview.wGrid, { shouldValidate: false, shouldDirty: true, shouldTouch: false });
  }, [preview, selected, setValue]);

  const assetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAssetChange = useCallback(
    (asset: string | undefined) => {
      const file = fromURL(ordinary, asset ?? "");
      const dt = detectDataType(asset, ordinary) ?? "html";
      setValue("fileVersion", file === null ? "" : file.version);
      setValue(
        "fileName",
        file === null ? "" : `${file.bucketName}/${file.name}`,
      );
      setValue("dataType", dt);

      partialUpdateSection({
        asset,
        assetId: file?.name ?? null,
        dataType: dt,
      });
    }, [ordinary, partialUpdateSection, setValue]
  );

  useEffect(() => {
    if (!section?.asset) return;
    onAssetChange(section.asset);
  }, [section?.asset, onAssetChange]);

  const isDisabled = section === null;

  const canUseAspect = !!section && (section.dataType === "images" || section.dataType === "videos");
  const isAspect = useSectionStore((s) => s.isAspectById[selected ?? ""] ?? false);
  const setIsAspect = (v: boolean) => {
    if (!selected) return;
    useSectionStore.getState().setIsAspectById(selected, v);
  };

  return (
    <section className="h-full px-4">
      <h2 className="mt-2 w-full text-center text-base font-bold">
        Section Config
      </h2>
      <Form {...form}>
        <div className="flex w-full flex-row">
          <div className="flex w-[calc(100%-2.5rem)] flex-col">
            <Geometry
              setMode={setMode}
              mode={mode}
              space={bounds}
              setValue={setValue}
              control={form.control}
              isDisabled={isDisabled}
              canUseAspect={canUseAspect}
              isAspect={isAspect}
              setIsAspect={setIsAspect}
            />
          <fieldset className="flex w-[calc((100%-2rem)-0.5rem)] flex-col" disabled={isDisabled}>
            <FormField
              control={form.control}
              name="asset"
              render={({ field }) => {
                const q = (field.value ?? "") as string;
                return (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-semibold">Asset</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          list="file-list"
                          value={q}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            if (assetTimeoutRef.current) clearTimeout(assetTimeoutRef.current);
                            assetTimeoutRef.current = setTimeout(() => {
                              onAssetChange(e.target.value);
                            }, 300);
                          }}
                          type="text"
                          disabled={isDisabled}
                          placeholder="Enter a file name or paste a URL..."
                        />
                        {q.length > 0 && (
                          <datalist id="file-list">
                            {ordinary
                              .filter((f) =>
                                `/store/${f.bucketName}/${f.name}?versionId=${f.version}`
                                  .toLowerCase()
                                  .includes(q.toLowerCase())
                              )
                              .slice(0, 20)
                              .map((f) => (
                                <option
                                  key={`${f.bucketName}/${f.name}/${f.version}`}
                                  value={`/store/${f.bucketName}/${f.name}?versionId=${f.version}`}
                                />
                              ))}
                          </datalist>
                        )}
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="icon-sm"
                            onClick={() => {
                              if (projectId.length === env.CONSTANTS.NEW_PROJECT_ID_LENGTH) {
                                toast.error("Please save the project before performing this action.");
                                return;
                              }
                              setAction("upload");
                              openDialog();
                            }}
                          >
                            <Upload />
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                  </FormItem>
              )}}
            />
          </fieldset>
          </div>
        </div>
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
  isDisabled,
  canUseAspect,
  isAspect,
  setIsAspect,
}: {
  mode: "custom" | "grid";
  setMode: (mode: "custom" | "grid") => void;
  setValue: UseFormSetValue<SectionConfigForm>;
  space: Observatory | null;
  control: Control<SectionConfigForm>;
  isDisabled: boolean;
  canUseAspect: boolean;
  isAspect: boolean;
  setIsAspect: (isAspect: boolean) => void;
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
    partialUpdateSection({ x: 0, y: 0, width: fromPercentage(100), height: fromPercentage(100) });
  };

  const partialUpdateSection = usePartialUpdateSection();

  const onCustomChange = (e: React.ChangeEvent<HTMLInputElement>, field: any, min: number, max: number) => {
    if (e.target.value === "") {
      field.onChange("");
      return;
    }
    const clamped = Math.min(max, Math.max(min, e.target.valueAsNumber))
    field.onChange(clamped);
    partialUpdateSection({ [field.name]: fromPercentage(clamped) });
  }

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
          {canUseAspect && (
            <label className="flex items-center gap-2 h-10 px-3 rounded-md border text-sm ml-3">
              <Input
                type="checkbox"
                className="h-4 w-4 accent-current"
                checked={isAspect}
                onChange={(e) => setIsAspect(e.target.checked)}
                disabled={isDisabled}
              />
              <span className="select-none">Lock Aspect Ratio</span>
            </label>
          )}
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
                  <Input {...field} 
                    type="number" 
                    className="relative pr-5" 
                    step="any" 
                    min={0} 
                    max={100 - (width ?? 0)} 
                    onChange={(e) => onCustomChange(e, field, 0, 100 - (width ?? 0))}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        field.onChange(0);
                        partialUpdateSection({ x: 0 });
                      }
                    }}
                  />
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
                  <Input {...field} 
                    type="number" 
                    className="relative pr-5" 
                    step="any" 
                    min={0} 
                    max={100 - (height ?? 0)} 
                    onChange={(e) => onCustomChange(e, field, 0, 100 - (height ?? 0))}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        field.onChange(0);
                        partialUpdateSection({ y: 0 });
                      }
                    }}
                  />
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
                  <Input {...field} 
                    type="number" 
                    className="relative pr-5" 
                    step="any" 
                    min={1}  
                    max={100 - (x ?? 0)} 
                    onChange={(e) => onCustomChange(e, field, 1, 100 - (x ?? 0))}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        field.onChange(25);
                        partialUpdateSection({ width: fromPercentage(25) });
                      }
                    }}
                  />
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
                  <Input {...field} 
                    type="number" 
                    className="relative pr-5" 
                    step="any" 
                    min={1}  
                    max={100 - (y ?? 0)} 
                    onChange={(e) => onCustomChange(e, field, 1, 100 - (y ?? 0))}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        field.onChange(25);
                        partialUpdateSection({ height: fromPercentage(25) });
                      }
                    }}
                  />
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
                <Input {...field} 
                  type="number" 
                  min={0} 
                  max={maxRowFrom} 
                  onChange={(e) => { 
                    if (e.target.value === "") {
                      field.onChange("");
                      return;
                    }
                    const clamped = Math.min(maxRowFrom, Math.max(0, e.target.valueAsNumber))
                    field.onChange(clamped);
                    if (space && rowTo !== undefined && !isNaN(clamped)) {
                      partialUpdateSection({ y: clamped / space.rows, height: (rowTo - clamped) / space.rows });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      field.onChange(0);
                      partialUpdateSection({ y: 0, height: (rowTo ?? 0) / (space?.rows ?? 1) });
                    }
                  }}
                />
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
                <Input {...field} 
                  type="number" 
                  min={minRowTo} 
                  max={space?.rows ?? 0}
                  onChange={(e) => { 
                    if (e.target.value === "") {
                      field.onChange("");
                      return;
                    }
                    if (space && rowFrom !== undefined) {
                      const clamped = Math.min(space.rows, Math.max(minRowTo, e.target.valueAsNumber))
                      field.onChange(clamped);
                      partialUpdateSection({ height: (clamped - rowFrom) / space.rows });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      field.onChange(minRowTo);
                      partialUpdateSection({ height: (minRowTo - rowFrom) / (space?.rows ?? 1) });
                    }
                  }}
                />
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
                <Input {...field} 
                  type="number" 
                  min={0} 
                  max={maxColFrom}
                  onChange={(e) => { 
                    if (e.target.value === "") {
                      field.onChange("");
                      return;
                    }
                    if (space && columnTo !== undefined) {
                      const clamped = Math.min(maxColFrom, Math.max(0, e.target.valueAsNumber))
                      field.onChange(clamped);
                      partialUpdateSection({ x: clamped / space.columns, width: (columnTo - clamped) / space.columns });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      field.onChange(0);
                      partialUpdateSection({ x: 0, width: (columnTo ?? 0) / (space?.columns ?? 1) });
                    }
                  }}
                />
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
                <Input {...field} 
                  type="number" 
                  min={minColTo} 
                  max={space?.columns ?? 0}
                  onChange={(e) => { 
                    if (e.target.value === "") {
                      field.onChange("");
                      return;
                    }
                    if (space && columnFrom !== undefined) {
                      const clamped = Math.min(space?.columns, Math.max(minColTo, e.target.valueAsNumber))
                      field.onChange(clamped);
                      partialUpdateSection({ width: (clamped - columnFrom) / space.columns });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      field.onChange(minColTo);
                      partialUpdateSection({ width: (minColTo - columnFrom) / (space?.columns ?? 1) });
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </fieldset>
    </div>
  );
};

export default SectionConfig;
