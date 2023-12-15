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
  getLatest: (id: string) => File
}

type MetadataForm = ProjectMetadata & {
  fileName: string | null
  fileVersion: string | null
}

const Metadata = ({
  files,
  project,
  updateProject,
  setAction,
  toURL,
  fromURL,
  getLatest
}: MetadataProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch
  } = useForm<MetadataForm>({
    defaultValues: {
      ...project,
      fileName: fromURL(project.thumbnail ?? "")?.name ?? "-- select an option --",
      fileVersion: fromURL(project.thumbnail ?? "")?.version.toString() ?? "-- select an option --"
    }
  });

  const onSubmit = (metadata: MetadataForm) => {
    const { fileName, fileVersion, ...config } = metadata;
    updateProject({
      ...project,
      ...config,
      thumbnail: fileName !== null && fileVersion !== null ? toURL(fileName, parseInt(fileVersion)) : null
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
      <label htmlFor="s3-select">Thumbnail:</label>
      <S3FileSelect id="s3-select" register={register}
                    getLatest={getLatest}
                    setValue={setValue}
                    files={files} fromURL={fromURL} watch={watch}
                    url={project.thumbnail ?? ""} />
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
