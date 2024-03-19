import React from "react";
import { type HardwareInfo } from "../../types";
import MultiActions from "../actions/multi-actions";
import SearchSelect from "../search-select/search-select";

import styles from "./toolbar.module.scss";

type ToolbarProps = {
  hardware: HardwareInfo[]
  setFilterType: (type: "id" | "tags") => void
  setFilter: (filter: string | null) => void
  filterType: "id" | "tags"
  filter: string | null
  name: string
}

const Toolbar = ({
  hardware,
  setFilterType,
  setFilter,
  filterType,
  filter,
  name
}: ToolbarProps) => <div className={styles.toolbar}>
  <p>Filter by</p>
  <div className={styles["filter-type-container"]}>
    <button className={filterType === "id" ? styles.active : undefined}
            onClick={() => setFilterType("id")}>ID
    </button>
    <button className={filterType === "tags" ? styles.active : undefined}
            onClick={() => setFilterType("tags")}>Tags
    </button>
  </div>
  <SearchSelect setFilter={setFilter} filter={filter}
                values={hardware.flatMap(({
                  device: {
                    id,
                    tags
                  }
                }) => filterType === "id" ? [id] : tags)} />
  <div className={styles["multi-actions"]}>
    <MultiActions bridgeId={name} type={filterType} value={filter} />
  </div>
</div>;

export default Toolbar;
