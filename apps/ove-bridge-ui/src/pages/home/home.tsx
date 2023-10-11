import Configuration from "./components/configuration/configuration";
import KeyPass from "./components/key-pass/key-pass";
import Calendar from "./components/calendar/calendar";
import { useEffect, useState } from "react";
import AutoModeConfiguration
  from "./components/auto-mode-configuration/auto-mode-configuration";
import { useDialog } from "@ove/ui-components";

const Home = () => {
  const [hasCalendar, setHasCalendar] = useState(false);
  const {ref, isOpen, openDialog, closeDialog} = useDialog();

  useEffect(() => {
    window.electron.hasCalendar().then(setHasCalendar);
  }, []);

  return <main style={{ display: "flex", flexDirection: "row" }}>
    <div>
      <Configuration
        setHasCalendar={setHasCalendar}
        openDialog={openDialog} />
      <KeyPass />
    </div>
    {hasCalendar ? <Calendar /> : null}
    {isOpen ? <AutoModeConfiguration
      ref={ref}
      closeDialog={closeDialog} /> : null}
  </main>;
};

export default Home;
