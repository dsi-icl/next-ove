import { useCallback, useEffect, useRef, useState } from "react";

export const useDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const close = useCallback(() => setDialogOpen(false), []);

  useEffect(() => {
    if (dialogOpen) {
      dialogRef.current?.showModal();
      dialogRef.current?.addEventListener("close", close);
    } else {
      dialogRef.current?.close();
      dialogRef.current?.removeEventListener("close", close);
    }
  }, [dialogOpen, close]);

  return {
    ref: dialogRef,
    isOpen: dialogOpen,
    closeDialog: () => setDialogOpen(false),
    openDialog: () => setDialogOpen(true)
  };
};