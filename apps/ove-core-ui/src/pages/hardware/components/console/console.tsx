import React from "react";
import Terminal, { ColorMode } from "react-terminal-ui";

const Console = ({ close }: { close: () => void }) => {
  return <>
    <Terminal name="React Terminal Usage Example" colorMode={ColorMode.Light}
              onInput={terminalInput => console.log(`New terminal input received: '${terminalInput}'`)}>
      Welcome to the demo!
    </Terminal>
    <button onClick={close}>Close</button>
  </>;
};

export default Console;