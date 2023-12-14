import { type CSSProperties, forwardRef, type ReactNode } from "react";

import styles from "./dialog.module.scss";

type DialogProps = {
  closeDialog: () => void
  children: ReactNode
  style?: CSSProperties
  title: string
  hiddenStyle?: CSSProperties
}

const Dialog = forwardRef<HTMLDialogElement, DialogProps>(({
  hiddenStyle,
  title,
  closeDialog,
  children,
  style
}, ref) =>
  <dialog ref={ref} onClick={closeDialog} style={style} title={title}
          className={styles.dialog}>
    <div onClick={e => e.stopPropagation()} className={styles.hidden}
         style={hiddenStyle}>
      {children}
    </div>
  </dialog>);

export default Dialog;
