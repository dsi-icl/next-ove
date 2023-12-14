import { type Actions, type File } from "../hooks";
import { useForm } from "react-hook-form";
import { type Project } from "@prisma/client";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./metadata.module.scss";

export type ProjectMetadata = Pick<Project, "title" | "description" | "thumbnail" | "presenterNotes" | "notes">

type MetadataProps = {
  project: ProjectMetadata
  updateProject: (metadata: ProjectMetadata) => void
  setAction: (action: Actions | null) => void
  files: File[]
  toURL: (name: string, version: number) => string
  fromURL: (url: string) => File | null
}

type MetadataForm = ProjectMetadata & {
  fileName: string | null
  fileVersion: number | null
}

const Metadata = ({
  files,
  project,
  updateProject,
  setAction,
  toURL,
  fromURL
}: MetadataProps) => {
  const {
    register,
    handleSubmit,
    resetField
  } = useForm<MetadataForm>({
    defaultValues: {
      ...project,
      fileName: fromURL(project.thumbnail ?? "")?.name,
      fileVersion: fromURL(project.thumbnail ?? "")?.version
    }
  });

  const onSubmit = (metadata: MetadataForm) => {
    const { fileName, fileVersion, ...config } = metadata;
    updateProject({
      ...project,
      ...config,
      thumbnail: fileName !== null && fileVersion !== null ? toURL(fileName, fileVersion) : null
    });
    setAction(null);
  };

  return <section id={styles["metadata"]}>
    <h2>Project Details</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="title">Title:</label>
      <input {...register("title")} />
      <label htmlFor="description">Description:</label>
      <textarea {...register("description")} />
      <label>Thumbnail:</label>
      <S3FileSelect ids={["fileName", "fileVersion"]} register={register}
                    files={files} resetField={() => resetField("fileVersion")}
                    defaultFile={fromURL(project.thumbnail ?? "")?.name ?? files?.[0].name ?? null} />
      <label htmlFor="notes">Notes:</label>
      <textarea {...register("notes")} />
      <label htmlFor="presenterNotes">Presenter Notes:</label>
      <textarea {...register("presenterNotes")} />
      <div className={styles.submit}>
        <button type="submit">SAVE</button>
      </div>
    </form>
  </section>;
};

export default Metadata;
