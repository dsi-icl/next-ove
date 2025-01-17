import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";

const PrinterInfo = ({ info }: {
  info: { printer: Systeminformation.PrinterData[] }
}) => <div>
  {info.printer?.map((printer, i) => <div key={i}>
    <h4 className="font-bold mt-6">Printer - {printer?.name}</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>id</TableCell>
          <TableCell>{format(printer?.id)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>model</TableCell>
          <TableCell>{format(printer?.model)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>uri</TableCell>
          <TableCell>{format(printer?.uri)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>uuid</TableCell>
          <TableCell>{format(printer?.uuid)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>status</TableCell>
          <TableCell>{format(printer?.status)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>local</TableCell>
          <TableCell>{format(printer?.local)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>default</TableCell>
          <TableCell>{format(printer?.default)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>shared</TableCell>
          <TableCell>{format(printer?.shared)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
</div>;

export default PrinterInfo;
