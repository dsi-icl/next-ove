import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import Header from "./header";
import { format } from "./utils";
import type { Systeminformation } from "systeminformation";

const NetworkInfo = ({ info }: {
  info: {
    interfaces: Systeminformation.NetworkInterfacesData[]
    interfaceDefault: string
    gatewayDefault: string
    stats: Systeminformation.NetworkStatsData[]
    connections: Systeminformation.NetworkConnectionsData[]
    inetChecksite: Systeminformation.InetChecksiteData
    inetLatency: number
  }
}) => <div>
  <h4 className="font-bold mt-6">General</h4>
  <Table>
    <Header />
    <TableBody>
      <TableRow>
        <TableCell>default interface</TableCell>
        <TableCell>{format(info.interfaceDefault)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>default gateway</TableCell>
        <TableCell>{format(info.gatewayDefault)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  {info.interfaces?.map(iface => <div key={iface?.iface}>
    <h4 className="font-bold mt-6">Interface - {iface?.iface}</h4>
    <Table>
      <Header />
      <TableBody>
        <TableRow>
          <TableCell>interface name</TableCell>
          <TableCell>{format(iface?.ifaceName)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>default</TableCell>
          <TableCell>{format(iface?.default)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ip4</TableCell>
          <TableCell>{format(iface?.ip4)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ip4 subnet</TableCell>
          <TableCell>{format(iface?.ip4subnet)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ip6</TableCell>
          <TableCell>{format(iface?.ip6)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ip6 subnet</TableCell>
          <TableCell>{format(iface?.ip6subnet)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>mac address</TableCell>
          <TableCell>{format(iface?.mac)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>internal</TableCell>
          <TableCell>{format(iface?.internal)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>virtual</TableCell>
          <TableCell>{format(iface?.virtual)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>operation state</TableCell>
          <TableCell>{format(iface?.operstate)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>type</TableCell>
          <TableCell>{format(iface?.type)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>duplex</TableCell>
          <TableCell>{format(iface?.duplex)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>mtu</TableCell>
          <TableCell>{format(iface?.mtu)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>speed</TableCell>
          <TableCell>{format(iface?.speed)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>dhcp</TableCell>
          <TableCell>{format(iface?.dhcp)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>dns suffix</TableCell>
          <TableCell>{format(iface?.dnsSuffix)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ieee 8021x auth</TableCell>
          <TableCell>{format(iface?.ieee8021xAuth)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ieee 8021x state</TableCell>
          <TableCell>{format(iface?.ieee8021xState)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>carrier changes</TableCell>
          <TableCell>{format(iface?.carrierChanges)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
  {info.stats?.map(stats => <div key={stats?.iface}>
    <h4>Interface Stats - {stats?.iface}</h4>
    <Table>
      <Header />
      <TableBody>
        <TableRow>
          <TableCell>operation state</TableCell>
          <TableCell>{format(stats?.operstate)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>received bytes</TableCell>
          <TableCell>{format(stats?.rx_bytes)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>received dropped</TableCell>
          <TableCell>{format(stats?.rx_dropped)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>received errors</TableCell>
          <TableCell>{format(stats?.rx_errors)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>transferred bytes</TableCell>
          <TableCell>{format(stats?.tx_bytes)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>transferred dropped</TableCell>
          <TableCell>{format(stats?.tx_dropped)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>transferred errors</TableCell>
          <TableCell>{format(stats?.tx_errors)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>received bytes per second</TableCell>
          <TableCell>{format(stats?.rx_sec)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>transferred bytes per second</TableCell>
          <TableCell>{format(stats?.tx_sec)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>interval length (ms)</TableCell>
          <TableCell>{format(stats?.ms)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
  {info.connections?.map((connection, i) => <div key={i}>
    <h4 className="font-bold mt-6">Connection - {i}</h4>
    <Table>
      <Header />
      <TableBody>
        <TableRow>
          <TableCell>protocol</TableCell>
          <TableCell>{format(connection?.protocol)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>local address</TableCell>
          <TableCell>{format(connection?.localAddress)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>local port</TableCell>
          <TableCell>{format(connection?.localPort)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>peer address</TableCell>
          <TableCell>{format(connection?.peerAddress)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>peer port</TableCell>
          <TableCell>{format(connection?.peerPort)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>state</TableCell>
          <TableCell>{format(connection?.state)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>pid</TableCell>
          <TableCell>{format(connection?.pid)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>process</TableCell>
          <TableCell>{format(connection?.process)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
  <h4 className="font-bold mt-6">INET Checksite</h4>
  <Table>
    <Header />
    <TableBody>
      <TableRow>
        <TableCell>url</TableCell>
        <TableCell>{format(info.inetChecksite?.url)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>ok</TableCell>
        <TableCell>{format(info.inetChecksite?.ok)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>status</TableCell>
        <TableCell>{format(info.inetChecksite?.status)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>response time (ms)</TableCell>
        <TableCell>{format(info.inetChecksite?.ms)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>latency</TableCell>
        <TableCell>{format(info.inetLatency)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>;

export default NetworkInfo;
