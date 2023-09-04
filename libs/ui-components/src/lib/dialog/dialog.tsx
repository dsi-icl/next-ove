import { type CSSProperties, forwardRef, type ReactNode } from "react";

type DialogProps = {
  closeDialog: () => void
  children: ReactNode
  style?: CSSProperties
  title: string
}

const Dialog = forwardRef<HTMLDialogElement, DialogProps>(({title, closeDialog, children, style}, ref) => {
  return <dialog ref={ref} onClick={closeDialog} style={style} title={title}>
    <div onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </dialog>
});

export default Dialog;
