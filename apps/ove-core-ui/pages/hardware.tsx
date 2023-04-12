import { useEffect, useState } from "react";
import { environment } from "../environments/environment";
import { DataGrid } from "@mui/x-data-grid";

const Hardware = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    console.log(`http://${environment.SERVER_URL}/hardware/devices`);
    fetch(`http://${environment.SERVER_URL}/hardware/devices`).then(res => res.json()).then(data => {
      console.log(JSON.stringify(data));
      setDevices(data);
    });
  }, []);

  const columns = [
    { field: "id", flex: 1, headerClassName: "grid-header" },
    { field: "description", flex: 1, headerClassName: "grid-header" },
    { field: "ip", flex: 1, headerClassName: "grid-header" },
    { field: "port", flex: 1, headerClassName: "grid-header" },
    { field: "protocol", flex: 1, headerClassName: "grid-header" },
    { field: "mac", flex: 1, headerClassName: "grid-header" },
    { field: "tags", flex: 1, headerClassName: "grid-header" }
  ];

  return <div style={{ width: "100vw", height: "100vh" }}>
    <h1 className="hardware-header"><strong>Hardware Management</strong></h1>
    {
      devices.map(bridge => (
        <div
          key={`${bridge["ove-bridge-id"]}-container`}
          style={{ minHeight: "10vh", height: "40vh", width: "100%" }}>
          <h4
            key={`${bridge["ove-bridge-id"]}-header`}>
            {bridge["ove-bridge-id"]}
          </h4>
          <DataGrid
            key={`${bridge["ove-bridge-id"]}-data`}
            columns={columns}
            rows={bridge["data"]} />
        </div>))
    }
  </div>;
};

export default Hardware;
