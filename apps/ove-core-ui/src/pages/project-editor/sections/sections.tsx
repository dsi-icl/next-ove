import { type Section } from "@prisma/client";
import { PlusCircle } from "react-bootstrap-icons";

import styles from "./sections.module.scss";

type SectionsProps = {
  sections: Section[]
  select: (id: string | null) => void
}

const Sections = ({ sections, select }: SectionsProps) =>
  <section id={styles["sections"]}>
    <h2>Sections</h2>
    <ul>
      {sections.map(section => <li key={section.id} style={{ display: "flex" }}>
        <button onClick={() => select(section.id)}>
          <span>{section.ordering}: </span><span
          className={styles.asset}>{section.asset.length < 25 ? section.asset : `${section.asset.slice(0, 24)}...`}</span>
        </button>
      </li>)}
    </ul>
    <button className={styles.new} onClick={() => select(null)}>
      <PlusCircle />
    </button>
  </section>;

export default Sections;
