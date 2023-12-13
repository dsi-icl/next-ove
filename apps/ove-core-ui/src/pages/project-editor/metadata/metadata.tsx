import { type Actions } from "../hooks";
import { useForm } from "react-hook-form";
import { type Project } from "@prisma/client";

import styles from "./metadata.module.scss";

export type ProjectMetadata = Pick<Project, "title" | "description" | "presenterNotes" | "notes">

type MetadataProps = {
  project: ProjectMetadata
  setAction: (action: Actions | null) => void
}

const Metadata = ({project, setAction}: MetadataProps) => {
  const {register, handleSubmit} = useForm<Project>({defaultValues: project});

  const onSubmit = () => {
    // TODO: add saving of metadata
    setAction(null);
  };

  return <section id={styles["metadata"]}>
    <h2>Project Details</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="title">Title:</label>
      <input {...register("title")} />
      <label htmlFor="description">Description:</label>
      <textarea {...register("description")} />
      <label htmlFor="notes">Notes:</label>
      <textarea {...register("notes")} />
      <label htmlFor="presenterNotes">Presenter Notes:</label>
      <textarea {...register("presenterNotes")} />
      <button type="submit">SAVE</button>
    </form>
  </section>;
};

export default Metadata;
