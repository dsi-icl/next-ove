import Configuration from "./components/configuration/configuration";
import KeyPass from "./components/key-pass/key-pass";

export default () => {
  return <main style={{display: "flex", flexDirection: "row"}}>
    <Configuration />
    <KeyPass />
  </main>;
}