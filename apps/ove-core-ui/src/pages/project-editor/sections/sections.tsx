import { type Section } from "@prisma/client";
import { PlusCircle } from "react-bootstrap-icons";
import { Import, X } from "lucide-react";

import styles from "./sections.module.scss";

type SectionsProps = {
  sections: Section[]
  select: (id: string | null) => void
  colors: {[dataType: string]: string}
  selected: string | null
}

const Sections = ({ sections, select, colors, selected }: SectionsProps) =>
  <section id={styles["sections"]}>
    <h2>Sections</h2>
    <ul>
      {sections.map(section => <li key={section.id} style={{backgroundColor: colors[section.dataType.toUpperCase()], borderWidth: selected === section.id ? "2px" : "1px"}}>
        <button className={styles.container} style={{flexGrow: 1}} onClick={() => select(section.id)}>
          <span style={{fontWeight: selected === section.id ? 700 : 400}}>{section.asset.length < 25 ? section.asset : `${section.asset.slice(0, 24)}...`}</span>
        </button>
        <div className={styles["clear-container"]}><button><X style={{border: `${selected === section.id ? "2px" : "1px"} solid black`, borderRadius: "50%"}} width="1rem" height="1rem" strokeWidth={selected === section.id ? "4px" : "2px"}/></button></div>
      </li>)}
    </ul>
    <div className={styles.new}>
      <button title="Import"><Import strokeWidth="1px" /></button>
      <button title="Add" onClick={() => select(null)}><PlusCircle /></button>
    </div>
  </section>;

export default Sections;
