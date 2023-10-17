import { assert } from "@ove/ove-utils";
import { useStore } from "../../../../store";

import styles from "./paginated-dialog.module.scss";

type PaginatedDialogProps<TData extends object> = {
  data: TData | TData[] | null
  children: JSX.Element | null
}

const PaginatedDialog = <TData extends object, >({
  data,
  children
}: PaginatedDialogProps<TData>) => {
  const idx = useStore(state => state.paginationIdx);
  const setIdx = useStore(state => state.setPaginationIdx);

  let maxLen = data !== null && "length" in data ? data.length : null;

  return data !== null ? <>
    {children}
    {maxLen !== null ? <div className={styles.container}>
      <div className={styles.actions}>
        <button id={styles["left"]}
                onClick={() => setIdx(idx === 0 ? 0 : idx - 1)}>Previous
        </button>
        <button
          onClick={() => setIdx(idx === assert(maxLen) - 1 ? assert(maxLen) - 1 : idx + 1)}>Next
        </button>
      </div>
    </div> : null}
  </> : null;
};

export default PaginatedDialog;
