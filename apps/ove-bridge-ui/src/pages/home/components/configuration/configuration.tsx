import { FormEvent, useEffect, useState } from "react";

const Configuration = () => {
  const [displayCoreURL, setDisplayCoreURL] = useState("");
  const [displayBridgeName, setDisplayBridgeName] = useState("");

  const updateCoreURL = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const coreURL = (formData.get("core-url") ?? "").toString();
    const bridgeName = (formData.get("bridge-name") ?? "").toString();

    setDisplayCoreURL(coreURL);
    setDisplayBridgeName(bridgeName);

    await window.electron.updateEnv(coreURL, bridgeName).catch(console.error);
  };

  useEffect(() => {
    window.electron.getEnv().then(({ coreURL, bridgeName }) => {
      setDisplayCoreURL(coreURL);
      setDisplayBridgeName(bridgeName);
    });
  }, []);

  return <section style={{margin: "2rem 0 0", width: "50vw", display: "flex", flexDirection: "column", alignItems: "center"}}>
    <h2 style={{ fontWeight: 700, fontSize: "24px" }}>Update Environment</h2>
    <form method="post" onSubmit={e => updateCoreURL(e)} style={{marginTop: "1rem", display: "flex", flexDirection: "column", width: "20vw"}}>
      <label htmlFor="core-url"
             style={{ fontWeight: "700", marginTop: "2rem" }}>Core URL</label>
      <input id="core-url" type="text" name="core-url" style={{
        border: "1px solid black",
        padding: "0.5rem",
        borderRadius: "20px"
      }} defaultValue={displayCoreURL} />
      <label htmlFor="bridge-name"
             style={{ fontWeight: "700", marginTop: "1rem" }}>Bridge Name</label>
      <input id="bridge-name" type="text" name="bridge-name" style={{
        border: "1px solid black",
        padding: "0.5rem",
        borderRadius: "20px"
      }} defaultValue={displayBridgeName} />
      <button type="submit" style={{
        color: "white",
        backgroundColor: "#002147",
        marginTop: "3rem",
        padding: "0.5rem",
        borderRadius: "20px"
      }}>Update
      </button>
    </form>
  </section>;
};

export default Configuration;