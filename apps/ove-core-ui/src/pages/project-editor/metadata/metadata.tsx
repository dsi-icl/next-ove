import { useState } from "react";
import { useForm } from "react-hook-form";
import { Brush, X } from "react-bootstrap-icons";
import { type Actions, type File } from "../hooks";
import { type Project, User } from "@prisma/client";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./metadata.module.scss";

export type ProjectMetadata = Pick<Project, "title" | "description" | "thumbnail" | "creatorId" | "tags" | "publications" | "collaboratorIds" | "presenterNotes" | "notes">

type MetadataProps = {
  project: ProjectMetadata
  updateProject: (metadata: ProjectMetadata) => void
  setAction: (action: Actions | null) => void
  files: File[]
  toURL: (name: string, version: number) => string
  fromURL: (url: string) => File | null
  getLatest: (id: string) => File
  allTags: string[]
  generator: () => { assetId: string, name: string } | null,
  accepted: User[],
  invited: User[],
  uninvited: User[],
  inviteCollaborator: (id: string) => void
  removeCollaborator: (id: string) => void
}

type MetadataForm = ProjectMetadata & {
  fileName: string | null
  fileVersion: string | null
  tag: string
  publication: string
  collaborator: string
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
  generator,
  accepted,
  invited,
  uninvited,
  inviteCollaborator,
  removeCollaborator
}: MetadataProps) => {
  const [tags, setTags] = useState(project.tags);
  const [publications, setPublications] = useState(project.publications);
  const [collaborators_, setCollaborators_] = useState<{
    username: string,
    status: "added" | "removed"
  }[]>([]);
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
    if (metadata.collaborator !== "") {
      if (uninvited.find(({ username }) => username === metadata.collaborator) !== undefined) {
        setCollaborators_(cur => [...cur, {
          username: metadata.collaborator,
          status: "added"
        }]);
      }
      setValue("collaborator", "");
      return;
    }
    const { fileName, fileVersion, ...config } = metadata;
    const added = collaborators_.filter(({ status }) => status === "added").map(({ username }) => uninvited.find(x => x.username === username)!);
    const all = invited.concat(accepted);
    const removed = collaborators_.filter(({ status }) => status === "removed").map(({ username }) => all.find(x => x.username === username && x.id !== project.creatorId)).filter(Boolean) as User[];
    added.forEach(x => inviteCollaborator(x.id));
    removed.forEach(x => removeCollaborator(x.id));
    updateProject({
      ...project,
      ...config,
      publications,
      tags,
      collaboratorIds: [...project.collaboratorIds.filter(x => removed.find(({ id }) => id === x) === undefined)],
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
                                          autoComplete="off"
                                          placeholder="Enter Tag:" /></li>
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
        <li className={styles.new}><input {...register("publication")}
                                          placeholder="Enter publication:" />
        </li>
      </ul>
      <label htmlFor="collaborator">Collaborators:</label>
      <ul className={styles.collaborators}>
        <h6>Accepted:</h6>
        <div className={styles.section}>
          {accepted.filter(x => collaborators_.find(y => x.username === y.username) === undefined).map(({ username }) =>
            <li
              key={username}>{username}
              <button type="button"
                      onClick={() => setCollaborators_(cur => [...cur, {
                        username,
                        status: "removed"
                      }])}><X /></button>
            </li>)}
        </div>
        <h6>Invited:</h6>
        <div className={styles.section}>
          {invited.filter(x => collaborators_.find(y => y.username === x.username) === undefined).map(({ username }) =>
            <li key={username}>{username}
              <button type="button"
                      onClick={() => setCollaborators_(cur => [...cur, {
                        username,
                        status: "removed"
                      }])}><X /></button>
            </li>)}
        </div>
        <h6>Pending:</h6>
        <div className={styles.section}>
          {collaborators_.map(({ username, status }) => <li key={username}
                                                            style={{ backgroundColor: status === "added" ? "#002147" : "lawngreen" }}>{username}
            <button type="button"
                    onClick={() => setCollaborators_(cur => cur.filter(x => x.username !== username))}>
              <X /></button>
          </li>)}
        </div>
        <li className={styles.new}><input {...register("collaborator")}
                                          placeholder="Invite Collaborator:"
                                          list="collaborator-backing" />
          <datalist id="collaborator-backing">
            {uninvited.filter(({ username }) => collaborators_.find(c => c.username === username) === undefined).map(({ username }) =>
              <option key={username} value={username}>{username}</option>)}
          </datalist>
        </li>
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
