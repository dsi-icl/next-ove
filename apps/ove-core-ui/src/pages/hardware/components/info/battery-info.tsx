import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import Header from "./header";
import { format } from "./utils";
import type { Systeminformation } from "systeminformation";

const BatteryInfo = ({ info }: { info: { battery: Systeminformation.BatteryData } }) => <div>
  <h4 className="font-bold mt-6">General</h4>
  <Table>
    <Header />
    <TableBody>
      <TableRow>
        <TableCell>present</TableCell>
        <TableCell>{format(info.battery?.hasBattery)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>cycle count</TableCell>
        <TableCell>{format(info.battery?.cycleCount)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>charging</TableCell>
        <TableCell>{format(info.battery?.isCharging)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>designed capacity</TableCell>
        <TableCell>{format(info.battery?.designedCapacity)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>maximum capacity</TableCell>
        <TableCell>{format(info.battery?.maxCapacity)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>current capacity</TableCell>
        <TableCell>{format(info.battery?.currentCapacity)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>voltage</TableCell>
        <TableCell>{format(info.battery?.voltage)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>capacity unit</TableCell>
        <TableCell>{format(info.battery?.capacityUnit)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>percent</TableCell>
        <TableCell>{format(info.battery?.percent)}%</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>time remaining</TableCell>
        <TableCell>{format(info.battery?.timeRemaining)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>ac connected</TableCell>
        <TableCell>{format(info.battery?.acConnected)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>type</TableCell>
        <TableCell>{format(info.battery?.type)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>model</TableCell>
        <TableCell>{format(info.battery?.model)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>manufacturer</TableCell>
        <TableCell>{format(info.battery?.manufacturer)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>serial</TableCell>
        <TableCell>{format(info.battery?.serial)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>;

export default BatteryInfo;
