import { env } from "../../env";

const Sockets = () => {
  return <main>
    <iframe id="content" src={`${env.CORE_URL}/admin/index.html`} title="Socket.IO Admin UI" style={{width: "100vw", height: "90vh"}}></iframe>
  </main>
};

export default Sockets;