import { FormEvent, useEffect, useState } from "react";

import styles from "./configuration.module.scss";

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

  return <section className={styles.section}>
    <h2>Update Environment</h2>
    <form method="post" onSubmit={e => updateCoreURL(e)} className={styles.form}>
      <label htmlFor="core-url">Core URL</label>
      <input id="core-url" type="text" name="core-url" defaultValue={displayCoreURL} />
      <label htmlFor="bridge-name">Bridge Name</label>
      <input id="bridge-name" type="text" name="bridge-name" defaultValue={displayBridgeName} />
      <button type="submit">Update
      </button>
    </form>
  </section>;
};

export default Configuration;