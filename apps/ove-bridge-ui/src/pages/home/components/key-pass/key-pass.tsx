import { Json } from "@ove/ove-utils";
import { Clipboard } from "react-bootstrap-icons";
import React, { useEffect, useState } from "react";
// TODO: investigate circular dependency
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Snackbar } from "@ove/ui-components";

import styles from "./key-pass.module.scss";

const KeyPass = () => {
  const [displayPublicKey, setDisplayPublicKey] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    window.bridge.getPublicKey({}).then(key => {
      if (typeof key !== "string") return;
      setDisplayPublicKey(key);
    });
  }, []);

  useEffect(() => {
    if (!isCopied) return;
    const ref = setTimeout(() => setIsCopied(false), 1500);
    return () => {
      clearTimeout(ref);
    };
  }, [isCopied]);

  return (
    <section className={styles.section}>
      <h2>Public Key</h2>
      <div className={styles["key-container"]}>
        <p>{displayPublicKey.slice(0, 50)} .....</p>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(
              Json.stringify(displayPublicKey)
            );
            setIsCopied(true);
          }}
        >
          <Clipboard />
        </button>
      </div>
      <Snackbar text="Copied" show={isCopied} />
    </section>
  );
};

export default KeyPass;
