import Configuration from "./components/configuration/configuration";
import KeyPass from "./components/key-pass/key-pass";
import Calendar from "./components/calendar/calendar";

export default () => {
  return <main style={{ display: "flex", flexDirection: "row" }}>
    <div>
      <Configuration />
      <KeyPass />
    </div>
    <Calendar />
  </main>;
}