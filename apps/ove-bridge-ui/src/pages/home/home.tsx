import Configuration from "./components/configuration/configuration";
import KeyPass from "./components/key-pass/key-pass";
import Calendar from "./components/calendar/calendar";
import { useCallback, useEffect, useRef, useState } from "react";
import AutoModeConfiguration
  from "./components/auto-mode-configuration/auto-mode-configuration";

const Home = () => {
  const [hasCalendar, setHasCalendar] = useState(false);
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
  }, [dialogOpen]);

  useEffect(() => {
    window.electron.hasCalendar().then(hasCalendar => setHasCalendar(hasCalendar));
  }, []);

  return <main style={{ display: "flex", flexDirection: "row" }}>
    <div>
      <Configuration setHasCalendar={setHasCalendar}
                     openDialog={() => setDialogOpen(true)} />
      <KeyPass />
    </div>
    {hasCalendar ? <Calendar /> : null}
    {dialogOpen ? <AutoModeConfiguration ref={dialogRef}
                                         closeDialog={() => setDialogOpen(false)} /> : null}
  </main>;
};

export default Home;