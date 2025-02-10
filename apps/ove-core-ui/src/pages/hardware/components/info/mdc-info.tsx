import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { MDCInfo as TMDCInfo } from "@ove/ove-types";
import { format } from "../../utils";
import React from "react";

const MDCInfo = ({ info }: { info: TMDCInfo }) => (
  <Table className="mt-6">
    <TableHeader />
    <TableBody>
      <TableRow>
        <TableCell>power</TableCell>
        <TableCell>{format(info.power)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>source</TableCell>
        <TableCell>{format(info.source)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>volume</TableCell>
        <TableCell>{format(info.volume)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>is muted</TableCell>
        <TableCell>{format(info.isMuted)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

export default MDCInfo;
