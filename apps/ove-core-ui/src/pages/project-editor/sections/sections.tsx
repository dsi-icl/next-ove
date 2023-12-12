import { type Section } from "@prisma/client";

import styles from "./sections.module.scss";

type SectionsProps = {
  sections: Section[]
}

const Sections = ({ sections }: SectionsProps) => {
  return <section id={styles["sections"]}>
    <h2>Sections</h2>
    <ul>
      {sections.map(section => <li key={section.id}>{section.id}</li>)}
    </ul>
  </section>;
};

export default Sections;
