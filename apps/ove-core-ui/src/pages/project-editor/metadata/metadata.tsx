import { z } from "zod";
import { assert } from "@ove/ove-utils";
import React, { useState } from "react";
import { type Actions } from "../hooks";
import { actionColors } from "../utils";
import { useForm } from "react-hook-form";
import { type File } from "@ove/ove-types";
import { type User } from "@prisma/client";
import { Brush, X } from "react-bootstrap-icons";
import { Button } from "@ove/ui-base-components";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./metadata.module.scss";
import { zodResolver } from "@hookform/resolvers/zod";

const ProjectMetadataSchema = z.strictObject({
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().nullable(),
  creatorId: z.string(),
  tags: z.string().array(),
  publications: z.string().array(),
  collaboratorIds: z.string().array(),
  presenterNotes: z.string(),
  notes: z.string()
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>

type MetadataProps = {
  project: ProjectMetadata
  updateProject: (metadata: ProjectMetadata) => void
  setAction: (action: Actions | null) => void
  files: File[]
  toURL: (name: string, version: number) => string
  fromURL: (url: string | null) => File | null
  getLatest: (id: string) => File
  allTags: string[]
  generator: () => { assetId: string, name: string } | null,
  accepted: User[],
  invited: User[],
  uninvited: User[],
  inviteCollaborator: (id: string) => void
  removeCollaborator: (id: string) => void
  closeDialog: () => void
}

const MetadataFormSchema = z.objectUtil.mergeShapes(
  ProjectMetadataSchema,
  z.strictObject({
    fileName: z.string().nullable(),
    fileVersion: z.string().nullable(),
    tag: z.string(),
    publication: z.string(),
    collaborator: z.string()
  })
);

type MetadataForm = z.infer<typeof MetadataFormSchema>

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
  removeCollaborator,
  closeDialog
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
      fileName: fromURL(project.thumbnail ?? "")?.name ??
        "-- select an option --",
      fileVersion: fromURL(project.thumbnail ?? "")?.version.toString() ??
        "-- select an option --"
    },
    resolver: zodResolver(MetadataFormSchema)
  });

  const generateThumbnail = () => {
    const file = assert(generator());
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
      setPublications(cur =>
        cur.includes(metadata.publication) ? cur :
          [...cur, metadata.publication]);
      setValue("publication", "");
      return;
    }
    if (metadata.collaborator !== "") {
      if (uninvited.find(({ username }) =>
        username === metadata.collaborator) !== undefined) {
        setCollaborators_(cur => [...cur, {
          username: metadata.collaborator,
          status: "added"
        }]);
      }
      setValue("collaborator", "");
      return;
    }
    const { fileName, fileVersion, ...config } = metadata;
    const added = collaborators_
      .filter(({ status }) => status === "added")
      .map(({ username }) =>
        assert(uninvited.find(x => x.username === username)));
    const all = invited.concat(accepted);
    const removed = collaborators_
      .filter(({ status }) => status === "removed")
      .map(({ username }) => all.find(x => x.username === username &&
        x.id !== project.creatorId)).filter(Boolean) as User[];
    added.forEach(x => inviteCollaborator(x.id));
    removed.forEach(x => removeCollaborator(x.id));
    updateProject({
      ...project,
      ...config,
      publications,
      tags,
      collaboratorIds: [...project.collaboratorIds.filter(x =>
        removed.find(({ id }) => id === x) === undefined)],
      thumbnail: fileName !== null && fileVersion !== null ?
        toURL(fileName, parseInt(fileVersion)) : null
    });
    setAction(null);
  };

  return <section id={styles["metadata"]}>
    <header>
      <h2>Project Details</h2>
      <button onClick={closeDialog}><X size="1.25rem" /></button>
    </header>
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
          {tags.map((tag, i) => {
            const backgroundColor = actionColors[i % tags.length];
            return <li key={tag}
                       style={{ backgroundColor }}>{tag}
              <button type="button"
                      onClick={() => setTags(cur =>
                        cur.filter(x => x !== tag))}>
                <X /></button>
            </li>;
          })}
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
                      onClick={() => setPublications(cur =>
                        cur.filter(x => x !== publication))}>
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
          {accepted.filter(x => collaborators_
            .find(y =>
              x.username === y.username) === undefined).map(({ username }) =>
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
          {invited.filter(x => collaborators_
            .find(y =>
              y.username === x.username) === undefined).map(({ username }) =>
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
          {collaborators_.map(({ username }) => <li key={username}>{username}
            <button type="button"
                    onClick={() => setCollaborators_(cur =>
                      cur.filter(x => x.username !== username))}>
              <X /></button>
          </li>)}
        </div>
        <li className={styles.new}
            style={{ marginTop: collaborators_.length > 0 ? "0.75rem" : 0 }}>
          <input {...register("collaborator")}
                 placeholder="Invite Collaborator:"
                 list="collaborator-backing" />
          <datalist id="collaborator-backing">
            {uninvited.filter(({ username }) => collaborators_
              .find(c =>
                c.username === username) === undefined).map(({ username }) =>
              <option key={username} value={username}>{username}</option>)}
          </datalist>
        </li>
      </ul>
      <label htmlFor="notes">Notes:</label>
      <textarea {...register("notes")} />
      <label htmlFor="presenterNotes">Presenter Notes:</label>
      <textarea {...register("presenterNotes")} />
      <div className={styles.submit}>
        <Button variant="default" type="submit">SAVE</Button>
      </div>
    </form>
  </section>;
};

export default Metadata;
