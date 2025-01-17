import {
  Table, TableBody,
  TableCell,
  TableRow
} from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";

const GeneralInfo = ({ info }: {
  info: { version: string, time: Systeminformation.TimeData }
}) => <Table className="mt-6">
  <TableHeader />
  <TableBody>
    <TableRow>
      <TableCell>version</TableCell>
      <TableCell>{format(info.version)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>time</TableCell>
      <TableCell>{new Date(info.time?.current).toISOString()}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>uptime</TableCell>
      <TableCell>{format(info.time?.uptime)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>timezone</TableCell>
      <TableCell>{format(info.time?.timezone)} - {format(info.time?.timezoneName)}</TableCell>
    </TableRow>
  </TableBody>
</Table>;

export default GeneralInfo;
