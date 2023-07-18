import { forwardRef } from "react";
import React from 'react';
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';

type ConsoleDialogProps = {
  close: () => void
}

const ConsoleDialog = forwardRef<HTMLDialogElement, ConsoleDialogProps>(({ close }, ref) => {
  return <dialog ref={ref} style={{ width: "30vw", height: "40vh" }}>
    <Terminal name='React Terminal Usage Example' colorMode={ ColorMode.Light }  onInput={ terminalInput => console.log(`New terminal input received: '${ terminalInput }'`) }>
      Welcome to the demo!
    </Terminal>
    <button onClick={close}>Close</button>
  </dialog>;
});

export default ConsoleDialog;