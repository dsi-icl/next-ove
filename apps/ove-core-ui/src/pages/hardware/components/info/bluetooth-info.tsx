import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";

const BluetoothInfo = ({ info }: { info: { devices: Systeminformation.BluetoothDeviceData[] } }) => <div>
  {info.devices?.map((device, i) => <div key={i}>
    <h4>Bluetooth Device - {i}</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>device</TableCell>
          <TableCell>{format(device?.device)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>name</TableCell>
          <TableCell>{format(device?.name)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>mac device</TableCell>
          <TableCell>{format(device?.macDevice)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>mac host</TableCell>
          <TableCell>{format(device?.macHost)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>battery percentage</TableCell>
          <TableCell>{format(device?.batteryPercent)}%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>manufacturer</TableCell>
          <TableCell>{format(device?.manufacturer)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>type</TableCell>
          <TableCell>{format(device?.type)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>connected</TableCell>
          <TableCell>{format(device?.connected)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
</div>;

export default BluetoothInfo;
