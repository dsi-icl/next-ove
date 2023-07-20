import { useEffect, useState } from "react";
import {Clipboard} from "react-bootstrap-icons";
import { Snackbar } from "@ove/ui-components";

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

  return <section style={{width: "50vw", margin: "2rem 0 0"}}>
    <h2 style={{fontSize: "24px", fontWeight: 700, width: "100%", textAlign: "center"}}>Public Key</h2>
    <div style={{display: "flex"}}>
      <p>{displayPublicKey.slice(0, 50)} .....</p>
      <button style={{margin: "auto"}} onClick={async () => {
        await navigator.clipboard.writeText(JSON.stringify(displayPublicKey));
        setIsCopied(true);
      }}><Clipboard /></button>
    </div>
    {isCopied ? <Snackbar text="Copied" /> : null}
  </section>;
};

export default KeyPass;