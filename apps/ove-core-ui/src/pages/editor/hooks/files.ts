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

export const fromURL = (files: TFile[], url: string | null) => {
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

export const useUpload = (projectId: string, metadata: { name: string }) => {
  const presignedPutRaw = api.projects.getPresignedPutURL.useQuery(
    {
      projectId,
      objectName: metadata.name,
    },
    { enabled: metadata.name !== "ERROR" },
  );
  const presignedPutFormatted = api.projects.getPresignedPutURL.useQuery(
    {
      projectId,
      objectName: getFormattedExtension(metadata.name),
    },
    { enabled: metadata.name !== "ERROR" },
  );
  const uploadFile = s3.uploadFile.useMutation();
  const formatFile = api.projects.formatData.useMutation();
  const apiUtils = api.useUtils();

  return async (payload: File) => {
    if (
      presignedPutRaw.status !== "success" ||
      isError(presignedPutRaw.data) ||
      presignedPutFormatted.status !== "success" ||
      isError(presignedPutFormatted.data)
    ) {
      toast.error(`Missing presigned URL for file ${metadata.name}`);
      return;
    }
    await uploadFile.mutateAsync({ url: presignedPutRaw.data, payload });

    const data = await payload.text();
    const dataType = getDataType(metadata.name);
    const formatted = await formatFile.mutateAsync({
      data,
      dataType: dataType.name,
      title: metadata.name,
      opts:
        dataType.name === "data-table"
          ? {
              containsHeader: false,
              tableSource: getFormattedExtension(metadata.name) as
                | "html"
                | "csv"
                | "tsv",
            }
          : undefined,
    });
    if (isError(formatted)) {
      toast.error("Error formatting file");
      return;
    }
    await uploadFile.mutateAsync({ url: presignedPutFormatted.data, payload });
    apiUtils.projects.getFiles.invalidate({ projectId }).catch();
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
    { enabled: env.MODE !== "development" },
  );
  const getData = s3.getFileData.useQuery(
    {
      url:
        getPresigned.status !== "success" || isError(getPresigned.data)
          ? ""
          : getPresigned.data,
    },
    { enabled: getPresigned.status === "success" },
  );

  if (env.MODE !== "development") {
    return getData.data ?? null;
  } else {
    switch (file.name) {
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
  }
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
