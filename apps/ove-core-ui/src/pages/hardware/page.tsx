import Observatory from "./components/observatory";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { trpc } from "../../utils/api";

const Hardware = () => {
  const getObservatories = trpc.core.getObservatories.useQuery();
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
      {getObservatories.status === "success" && !("oveError" in getObservatories.data) ? getObservatories.data?.map(({ name, isOnline }) => <Observatory
        name={name} isOnline={isOnline} key={name}
        style={{ marginTop: "2rem" }} />) : null}
    </main>
  </HelmetProvider>;
}

export default Hardware;