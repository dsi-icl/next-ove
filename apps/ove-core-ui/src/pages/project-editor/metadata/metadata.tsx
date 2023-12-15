import { useState } from "react";
import { type Actions, type File } from "../hooks";
import { useForm } from "react-hook-form";
import { type Project } from "@prisma/client";
import { Brush, X } from "react-bootstrap-icons";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./metadata.module.scss";

export type ProjectMetadata = Pick<Project, "title" | "description" | "thumbnail" | "tags" | "publications" | "presenterNotes" | "notes">

type MetadataProps = {
  project: ProjectMetadata
  updateProject: (metadata: ProjectMetadata) => void
  setAction: (action: Actions | null) => void
  files: File[]
  toURL: (name: string, version: number) => string
  fromURL: (url: string) => File | null
  getLatest: (id: string) => File
  allTags: string[]
  generator: () => { assetId: string, name: string } | null
}

type MetadataForm = ProjectMetadata & {
  fileName: string | null
  fileVersion: string | null
  tag: string
  publication: string
}

const colors = ["#ef476f", "#f78c6b", "#ffd166", "#06d6a0", "#118ab2", "#002147", "#FA9E78", "#FDEBDC", "#6B9A9B"];

const Metadata = ({
  files,
  project,
  updateProject,
  setAction,
  toURL,
  fromURL,
  getLatest,
  allTags,
  generator
}: MetadataProps) => {
  const [tags, setTags] = useState(project.tags);
  const [publications, setPublications] = useState(project.publications);
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

  const generateThumbnail = () => {
    const file = generator()!;
    setTimeout(() => {
      setValue("fileName", file.name);
      setValue("fileVersion", "1");
    }, 250);
  };

  const onSubmit = (metadata: MetadataForm) => {
    if (metadata.tag !== "") {
      setTags(cur => cur.includes(metadata.tag) ? cur : [...cur, metadata.tag]);
      setValue("tag", "");
      return;
    }
    if (metadata.publication !== "") {
      setPublications(cur => cur.includes(metadata.publication) ? cur : [...cur, metadata.publication]);
      setValue("publication", "");
      return;
    }
    const { fileName, fileVersion, ...config } = metadata;
    updateProject({
      ...project,
      ...config,
      publications,
      tags,
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
      <label htmlFor={styles["s3-select"]}>Thumbnail:</label>
      <div className={styles.thumbnail}>
        <S3FileSelect id={styles["s3-select"]} register={register}
                      getLatest={getLatest}
                      setValue={setValue}
                      files={files} fromURL={fromURL} watch={watch}
                      url={project.thumbnail ?? ""} />
        <button type="button" onClick={generateThumbnail}><Brush /></button>
      </div>
      <label htmlFor="tag">Tags:</label>
      <ul className={styles.tags}>
        <div className={styles.selected}>
          {tags.map((tag, i) => <li key={tag}
                                    style={{ backgroundColor: colors[i % tags.length] }}>{tag}
            <button type="button"
                    onClick={() => setTags(cur => cur.filter(x => x !== tag))}>
              <X /></button>
          </li>)}
        </div>
        <li className={styles.new}><input {...register("tag")}
                                          list="tags-backing"
                                          autoComplete="off" /></li>
        <datalist id="tags-backing">
          {allTags.filter(tag => !tags.includes(tag)).map(tag => <option
            key={tag} value={tag}>{tag}</option>)}
        </datalist>
      </ul>
      <label htmlFor="publication">Publications</label>
      <ul className={styles.publications}>
        <div className={styles.selected}>
          {publications.map(publication => <li
            key={publication}>
            <div>{publication}
              <button type="button"
                      onClick={() => setPublications(cur => cur.filter(x => x !== publication))}>
                <X /></button>
            </div>
          </li>)}
        </div>
        <li className={styles.new}><input {...register("publication")} /></li>
      </ul>
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
