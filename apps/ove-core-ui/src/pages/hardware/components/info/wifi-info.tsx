import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";

const WifiInfo = ({ info }: {
  info: {
    networks: Systeminformation.WifiNetworkData[]
    interfaces: Systeminformation.WifiInterfaceData[]
    connections: Systeminformation.WifiConnectionData[]
  }
}) => <div>
  {info["networks"]?.map((network, i) =>
    <div key={network?.["ssid"]}>
      <h4 className="font-bold mt-6">Network - {i}</h4>
      <Table>
        <TableHeader />
        <TableBody>
          <TableRow>
            <TableCell>ssid</TableCell>
            <TableCell>{format(network?.ssid)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>bssid</TableCell>
            <TableCell>{format(network?.bssid)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>mode</TableCell>
            <TableCell>{format(network?.mode)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>channel</TableCell>
            <TableCell>{format(network?.channel)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>frequency</TableCell>
            <TableCell>{format(network?.frequency)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>signal level</TableCell>
            <TableCell>{format(network?.signalLevel)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>quality</TableCell>
            <TableCell>{format(network?.quality)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>security</TableCell>
            <TableCell>{format(network?.security)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>wpa flags</TableCell>
            <TableCell>{format(network?.wpaFlags)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>rsn flags</TableCell>
            <TableCell>{format(network?.rsnFlags)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>) ?? null}
  {info["interfaces"]?.map((iface, i) =>
    <div key={i}>
      <h4 className="font-bold mt-6">Interface - {i}</h4>
      <Table>
        <TableHeader />
        <TableBody>
          <TableRow>
            <TableCell>id</TableCell>
            <TableCell>{format(iface?.id)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>interface</TableCell>
            <TableCell>{format(iface?.iface)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>model</TableCell>
            <TableCell>{format(iface?.model)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>vendor</TableCell>
            <TableCell>{format(iface?.vendor)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>mac address</TableCell>
            <TableCell>{format(iface?.mac)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>) ?? null}
  {info["connections"]?.map((connection, i) =>
    <div key={i}>
      <h4 className="font-bold mt-6">Connection - {i}</h4>
      <Table>
        <TableHeader />
        <TableBody>
          <TableRow>
            <TableCell>id</TableCell>
            <TableCell>{format(connection?.id)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>interface</TableCell>
            <TableCell>{format(connection?.iface)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>model</TableCell>
            <TableCell>{format(connection?.model)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ssid</TableCell>
            <TableCell>{format(connection?.ssid)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>bssid</TableCell>
            <TableCell>{format(connection?.bssid)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>channel</TableCell>
            <TableCell>{format(connection?.channel)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>frequency</TableCell>
            <TableCell>{format(connection?.frequency)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>type</TableCell>
            <TableCell>{format(connection?.type)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>security</TableCell>
            <TableCell>{format(connection?.security)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>signal level</TableCell>
            <TableCell>{format(connection?.signalLevel)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>quality</TableCell>
            <TableCell>{format(connection?.quality)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>transaction rate</TableCell>
            <TableCell>{format(connection?.txRate)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>) ?? null}
</div>;

export default WifiInfo;
