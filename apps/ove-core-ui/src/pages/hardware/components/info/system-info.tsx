import {
  Table, TableBody,
  TableCell,
  TableRow
} from "@ove/ui-base-components";
import Header from "./header";
import { format } from "./utils";
import type { Systeminformation } from "systeminformation";

const SystemInfo = ({ info }: {
  info: {
    system: Systeminformation.SystemData
    bios: Systeminformation.BiosData
    baseboard: Systeminformation.BaseboardData
    chassis: Systeminformation.ChassisData
  }
}) => <div>
  <h4 className="font-bold mt-6">System</h4>
  <Table>
    <Header />
    <TableBody>
      <TableRow>
        <TableCell>manufacturer</TableCell>
        <TableCell>{format(info.system?.manufacturer)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>model</TableCell>
        <TableCell>{format(info.system?.model)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>version</TableCell>
        <TableCell>{format(info.system?.version)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>serial</TableCell>
        <TableCell>{format(info.system?.serial)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>uuid</TableCell>
        <TableCell>{format(info.system?.uuid)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>sku</TableCell>
        <TableCell>{format(info.system?.sku)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>virtual</TableCell>
        <TableCell>{format(info.system?.virtual)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <h4 className="font-bold mt-6">BIOS</h4>
  <Table>
    <Header />
    <TableBody>
      <TableRow>
        <TableCell>vendor</TableCell>
        <TableCell>{format(info.bios?.vendor)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>version</TableCell>
        <TableCell>{format(info.bios?.version)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>release date</TableCell>
        <TableCell>{format(info.bios?.releaseDate)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>revision</TableCell>
        <TableCell>{format(info.bios?.revision)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>serial</TableCell>
        <TableCell>{format(info.bios?.serial)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <h4 className="font-bold mt-6">Baseboard</h4>
  <Table>
    <Header />
    <TableBody>
      <TableRow>
        <TableCell>manufacturer</TableCell>
        <TableCell>{format(info.baseboard?.manufacturer)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>model</TableCell>
        <TableCell>{format(info.baseboard?.model)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>version</TableCell>
        <TableCell>{format(info.baseboard?.version)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>serial</TableCell>
        <TableCell>{format(info.baseboard?.serial)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>asset tag</TableCell>
        <TableCell>{format(info.baseboard?.assetTag)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>max memory</TableCell>
        <TableCell>{format(info.baseboard?.memMax)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>memory slots</TableCell>
        <TableCell>{format(info.baseboard?.memSlots)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <h4 className="font-bold mt-6">Chassis</h4>
  <Table>
    <Header />
    <TableBody>
      <TableRow>
        <TableCell>manufacturer</TableCell>
        <TableCell>{format(info.chassis?.manufacturer)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>model</TableCell>
        <TableCell>{format(info.chassis?.model)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>type</TableCell>
        <TableCell>{format(info.chassis?.type)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>version</TableCell>
        <TableCell>{format(info.chassis?.version)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>serial</TableCell>
        <TableCell>{format(info.chassis?.serial)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>asset tag</TableCell>
        <TableCell>{format(info.chassis?.assetTag)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>sku</TableCell>
        <TableCell>{format(info.chassis?.sku)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>;

export default SystemInfo;
