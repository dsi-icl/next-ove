import { useEffect, useState } from "react";
import { createClient } from "../../utils";
import Observatory from "./components/observatory";
import { Helmet, HelmetProvider } from "react-helmet-async";

export default () => {
  const [observatories, setObservatories] = useState<{
    name: string,
    isOnline: boolean
  }[] | null>(null);

  useEffect(() => {
    const client = createClient();
    client.hardware.getObservatories.query().then(setObservatories).catch(console.error);
  }, []);

  return <HelmetProvider>
    <main>
      <Helmet>
        <title>Next-OVE Hardware</title>
      </Helmet>
      <h1 style={{
        fontWeight: 700,
        fontSize: "24px",
        marginTop: "1rem",
        width: "100vw",
        textAlign: "center"
      }}>Hardware Manager</h1>
      {observatories?.map(({ name, isOnline }) => <Observatory
        name={name} isOnline={isOnline} key={name}
        style={{ marginTop: "2rem" }} />)}
    </main>
  </HelmetProvider>;
}