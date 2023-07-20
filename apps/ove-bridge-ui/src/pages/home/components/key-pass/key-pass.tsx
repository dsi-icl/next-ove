import { useEffect, useState } from "react";
import {Clipboard} from "react-bootstrap-icons";
import { Snackbar } from "@ove/ui-components";
import styles from "./key-pass.module.scss";

const KeyPass = () => {
  const [displayPublicKey, setDisplayPublicKey] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    window.electron.getPublicKey().then(key => setDisplayPublicKey(key));
  }, []);

  useEffect(() => {
    if (!isCopied) return;
    const ref = setTimeout(() => setIsCopied(false), 1500);
    return () => {
      clearTimeout(ref);
    };
  }, [isCopied]);

  return <section className={styles.section}>
    <h2>Public Key</h2>
    <div className={styles["key-container"]}>
      <p>{displayPublicKey.slice(0, 50)} .....</p>
      <button onClick={async () => {
        await navigator.clipboard.writeText(JSON.stringify(displayPublicKey));
        setIsCopied(true);
      }}><Clipboard /></button>
    </div>
    {isCopied ? <Snackbar text="Copied" /> : null}
  </section>;
};

export default KeyPass;