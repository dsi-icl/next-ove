import { z } from "zod";
import { assert } from "@ove/ove-utils";
import type { Actions } from "../hooks";
import { actionColors } from "../utils";
import { useForm } from "react-hook-form";
import type { File } from "@ove/ove-types";
import type { User } from "@prisma/client";
import { Brush, X } from "react-bootstrap-icons";
import { Button } from "@ove/ui-base-components";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrorHandling } from "@ove/ui-components";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./metadata.module.scss";

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
  toURL: (name: string, version: string) => string
  fromURL: (url: string | null) => File | null
  getLatest: (name: string) => File
  allTags: string[]
  generator: () => void,
  accepted: User[],
  invited: User[],
  uninvited: User[],
  inviteCollaborator: (id: string) => void
  removeCollaborator: (id: string) => void
  closeDialog: () => void
  bucketName: string
}

const CustomDataSchema = z.strictObject({
  fileName: z.string().nullable(),
  fileVersion: z.string().nullable(),
  tag: z.string(),
  publication: z.string(),
  collaborator: z.string()
});

const MetadataFormSchema =
  ProjectMetadataSchema.merge(CustomDataSchema).strict();

type MetadataForm = z.infer<typeof MetadataFormSchema>

// TODO: add isPublic flag
const Metadata = ({
  bucketName,
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
    watch,
    formState: { errors }
  } = useForm<MetadataForm>({
    defaultValues: {
      tags: project.tags,
      publications: project.publications,
      collaboratorIds: project.collaboratorIds,
      title: project.title,
      description: project.description,
      thumbnail: project.thumbnail,
      creatorId: project.creatorId,
      presenterNotes: project.presenterNotes,
      notes: project.notes,
      fileName: fromURL(project.thumbnail ?? "")?.name ??
        "-- select an option --",
      fileVersion: fromURL(project.thumbnail ?? "")?.version.toString() ??
        "-- select an option --"
    },
    resolver: zodResolver(MetadataFormSchema)
  });
  useFormErrorHandling(errors);

  // TODO: ensure fields update and generating thumbnail invalidates project
  const generateThumbnail = () => {
    generator();
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
    const {
      fileName,
      fileVersion,
      tag: _tag,
      publication: _publication,
      collaborator: _collaborator,
      ...config
    } = metadata;
    const added = collaborators_
      .filter(({ status }) => status === "added")
      .map(({ username }) =>
        assert(uninvited.find(x => x.username === username)));
    const all = invited.concat(accepted);
    const removed = collaborators_
      .filter(({ status }) => status === "removed")
      .map(({ username }) => all.find(x => x.username === username &&
        x.id !== project.creatorId)).filter(Boolean);
    added.forEach(x => inviteCollaborator(x.id));
    removed.forEach(x => removeCollaborator(x.id));
    updateProject({
      ...project,
      ...config,
      publications,
      tags,
      collaboratorIds: [...project.collaboratorIds.filter(x =>
        removed.find(({ id }) => id === x) === undefined)],
      thumbnail: fileName !== null && fileName !== undefined &&
      fileName !== "-- select an option --" && fileVersion !== null &&
      fileVersion !== undefined && fileVersion !== "-- select an option --" ?
        toURL(fileName, fileVersion) : null
    });
    setAction(null);
  };
  const tagsFilter = (tags: string[], tag: string) =>
    tags.filter(x => x !== tag);
  const publicationsFilter = (publications: string[], publication: string) =>
    publications.filter(x => x !== publication);
  const usernameFilter = <T extends object, >(usernames: (T & {
    username: string
  })[], username: string): (T & {
    username: string
  })[] => usernames.filter(x => x.username !== username);

  const fileName = watch("fileName");

  useEffect(() => {
    if (fileName === null || fileName === undefined ||
      fileName === "-- select an option --") return;
    setValue("fileVersion", getLatest(fileName).version);
  }, [setValue, fileName, bucketName, getLatest]);

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
                      files={files} watch={watch} />
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
                      onClick={() => setTags(cur => tagsFilter(cur, tag))}>
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
                        publicationsFilter(cur, publication))}>
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
                      usernameFilter(cur, username))}>
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
        <Button variant="default" type="submit">UPDATE</Button>
      </div>
    </form>
  </section>;
};

export default Metadata;
