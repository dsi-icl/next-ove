import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { useMemo, useState } from "react";
import { env, logger } from "../../../env";
import { api, s3 } from "../../../utils/api";
import { dataTypes, type File as TFile, isError } from "@ove/ove-types";

export const toURL = (bucketName: string, name: string, version: string) =>
  `/store/${bucketName}/${name}?versionId=${version}`;

const getDataType = (name: string) =>
  assert(
    dataTypes.find((dt) =>
      dt.extensions.includes(`.${getFormattedExtension(name)}`),
    ),
  );

const getFormattedExtension = (name: string) => assert(name.split(".").at(-1));

export const hasVersion = (
  files: TFile[],
  bucketName: string,
  name: string,
  version: string,
) => {
  name = name.startsWith(`${bucketName}/`)
    ? assert(name.split("/").at(-1))
    : name;
  return files
    .filter((file) => file.name === name && file.bucketName === bucketName)
    .map((f) => f.version)
    .includes(version);
};

export const fromURL = (files: TFile[], url: string | null): TFile | null => {
  if (url === null) return null;
  const parsed = /^\/store\/(.+)\/(.+)\?versionId=(.+)$/.exec(url);
  if (parsed === null || parsed.length !== 4) return null;
  return (
    files.find(
      ({ bucketName, name, version }) =>
        bucketName === parsed[1] && name === parsed[2] && version === parsed[3],
    ) ?? null
  );
};

export const useUpload = (projectId: string) => {
  const uploadFile = s3.uploadFile.useMutation();
  const formatFile = api.projects.formatData.useMutation();
  const apiUtils = api.useUtils();
  const client = apiUtils.client;

  type UploadIntent = "create" | "update" | "auto";

  const checkDuplicateName = async (objectName: string) => {
    const files = await client.projects.getFiles.query({ projectId });
    return !isError(files) && files.some(f => f.name.toLowerCase() === objectName.toLowerCase());
  };

  return async ({ objectName, file, intent="auto" }: { objectName: string; file: File; intent?: UploadIntent }): Promise<boolean> => {
    try {
      if (!objectName) { toast.error("Missing filename"); return false; }

      const isDuplicate = await checkDuplicateName(objectName);
      if (isDuplicate && intent === "create") {
        toast.error(`File with name "${objectName}" already exists`);
        return false;
      }
      if (!isDuplicate && intent === "update") {
        toast.error(`File with name "${objectName}" does not exist`);
        return false;
      }

      const data = await file.text();
      const dt = getDataType(objectName);
      const formatted = await formatFile.mutateAsync({
        data,
        dataType: dt.name,
        title: objectName,
        opts:
          dt.name === "data-table"
            ? {
                containsHeader: false,
                tableSource: getFormattedExtension(objectName) as "html" | "csv" | "tsv",
              }
            : undefined,
      });
      if (isError(formatted)) {
        toast.error(formatted.oveError ?? "Error formatting file");
        return false;
      }

      const rawUrl = await client.projects.getPresignedPutURL.query({ projectId, objectName });
      if (isError(rawUrl)) {
        toast.error(`Missing presigned URL for raw file: ${objectName}`);
        return false;
      }

      await uploadFile.mutateAsync({ url: rawUrl, payload: file });

      const { data: formattedText, fileName } = formatted;
      const formattedUrl = await client.projects.getPresignedPutURL.query({
        projectId,
        objectName: fileName,
      });
      if (isError(formattedUrl)) {
        toast.error("Missing presigned URL for formatted file");
        return false;
      }

      const formattedFile = new File([formattedText], fileName, { type: getFormattedExtension(fileName) === "html" ? "text/html" : "text/plain" });
      await uploadFile.mutateAsync({ url: formattedUrl, payload: formattedFile });

      apiUtils.projects.getFiles.invalidate({ projectId }).catch(() => {});
      toast.success("Upload complete");
      return true;
    } catch (e) {
      toast.error((e as Error).message || "Upload failed");
      return false;
    }
  };
};

export const getLatest = (files: TFile[], bucketName: string, name: string) => {
  name = name.startsWith(`${bucketName}/`)
    ? assert(name.split("/").at(-1))
    : name;
  const file = files.find(
    (file) =>
      file.name === name && file.bucketName === bucketName && file.isLatest,
  );
  if (!file) {
    throw new Error("File not found");
  }
  return file;
};

export const useLatest = (
  projectId: string,
  name: string,
  bucketName: string,
) => {
  const { files } = useFiles(projectId);
  return useMemo(
    () => getLatest(files, bucketName, name),
    [files, bucketName, name],
  );
};

export const useFiles = (projectId: string) => {
  const getFiles = api.projects.getFiles.useQuery(
    { projectId },
    { enabled: projectId.length !== env.CONSTANTS.NEW_PROJECT_ID_LENGTH },
  );

  const files = useMemo(() => {
    if (getFiles.status !== "success" || isError(getFiles.data)) {
      return [];
    } else {
      return getFiles.data;
    }
  }, [getFiles.status, getFiles.data]);

  const local = useMemo(() => files.filter((f) => !f.isGlobal), [files]);
  const global = useMemo(() => files.filter((f) => f.isGlobal), [files]);
  const ordinary = useMemo(
    () => local.filter((f) => !["control.html", "env.json"].includes(f.name)),
    [local],
  );

  return {
    files,
    local,
    global,
    ordinary,
  };
};

export const useData = (file: TFile) => {
  const getPresigned = api.projects.getPresignedGetURL.useQuery(
    {
      bucketName: file.bucketName,
      objectName: file.name,
      versionId: file.version,
    },
    { enabled: !!file?.name }
  );

  const getData = s3.getFileData.useQuery(
    {
      url:
        getPresigned.status !== "success" || isError(getPresigned.data)
          ? ""
          : getPresigned.data,
    },
    { enabled: getPresigned.status === "success" }
  );

  const exampleFor = (name: string) => {
    switch (name) {
      case "control.html":
        return `<!DOCTYPE html>
<html lang="en">
<head><title>Controller</title></head>
<body></body>
</html>`;
      case "env.json":
        return JSON.stringify({ EXAMPLE_KEY: "hello world" });
      default:
        return "";
    }
  };

  if (getData.status === "success" && typeof getData.data === "string") {
    return getData.data
  }

  if (getData.status === "error") {
    return exampleFor(file.name);
  }

  return null;
};


export const useFileWithEdit = (
  name: string,
  bucket: string,
  projectId: string,
) => {
  const file = useLatest(projectId, name, bucket);
  const initial = useData(file);
  const [data, setData] = useState<string | null>(null);

  return {
    setData,
    data: data === null ? (initial ?? "") : data,
    file,
    initial,
  };
};

export const useThumbnail = (projectId: string, tags: string[]) => {
  const apiUtils = api.useUtils();
  const generateThumbnail = api.projects.generateThumbnail.useMutation({
    retry: false,
    onSuccess: () => {
      apiUtils.projects.getProject
        .invalidate({ projectId })
        .catch(logger.error);
    },
  });

  return () =>
    generateThumbnail
      .mutateAsync({
        projectId,
        tags,
      })
      .catch(logger.error);
};
