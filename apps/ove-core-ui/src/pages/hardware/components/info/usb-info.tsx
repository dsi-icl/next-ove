import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";

const USBInfo = ({ info }: { info: { usb: Systeminformation.UsbData[] } }) =>
  <div>
    {info.usb?.map((usb, i) => <div key={i}>
      <h4 className="font-bold mt-6">USB - {i}</h4>
      <Table>
        <TableHeader />
        <TableBody>
          <TableRow>
            <TableCell>bus</TableCell>
            <TableCell>{format(usb?.bus)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>device id</TableCell>
            <TableCell
              className="break-words break-all">{format(usb?.deviceId)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>id</TableCell>
            <TableCell>{format(usb?.id)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>name</TableCell>
            <TableCell>{format(usb?.name)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>type</TableCell>
            <TableCell>{format(usb?.type)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>removable</TableCell>
            <TableCell>{format(usb?.removable)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>vendor</TableCell>
            <TableCell>{format(usb?.vendor)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>manufacturer</TableCell>
            <TableCell>{format(usb?.manufacturer)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>maximum power</TableCell>
            <TableCell>{format(usb?.maxPower)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>serial number</TableCell>
            <TableCell>{format(usb?.serialNumber)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>) ?? null}
  </div>;

export default USBInfo;
