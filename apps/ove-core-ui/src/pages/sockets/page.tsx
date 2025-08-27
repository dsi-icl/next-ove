import React from "react";
import { env } from "../../env";

const Sockets = () => {
  return (
    <main>
      <iframe
        id="content"
        src={`${env.CORE_URL}/sockets/admin/index.html`}
        title="Socket.IO Admin UI"
        className="w-screen h-[90vh]"
      ></iframe>
    </main>
  );
};

export default Sockets;
