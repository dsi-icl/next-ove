import React from "react";
import { assert } from "@ove/ove-utils";

import styles from "./paginated-dialog.module.scss";

type PaginatedDialogProps = {
  children: React.ReactNode | null
  maxLen: number
  idx: number
  setIdx: (idx: number) => void
}

const PaginatedDialog = ({
  children,
  maxLen,
  idx,
  setIdx
}: PaginatedDialogProps) =>
  <div className={styles.full}>
    {children}
    {maxLen > 1 ? <div className={styles.container}>
      <div className={styles.actions}>
        <button id={styles["left"]}
                onClick={() => setIdx(idx === 0 ? 0 : idx - 1)}>Previous
        </button>
        <button
          onClick={() =>
            setIdx(idx === assert(maxLen) - 1 ? assert(maxLen) - 1 : idx + 1)}>
          Next
        </button>
      </div>
    </div> : null}
  </div>;

export default PaginatedDialog;
