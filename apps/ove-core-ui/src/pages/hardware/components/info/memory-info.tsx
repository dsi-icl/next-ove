import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";
import React from "react";

const MemoryInfo = ({
  info,
}: {
  info: {
    memory: Systeminformation.MemData;
    layout: Systeminformation.MemLayoutData[];
  };
}) => (
  <div>
    <h4 className="mt-6 font-bold">General</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>total</TableCell>
          <TableCell>{format(info["memory"]?.["total"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>free</TableCell>
          <TableCell>{format(info["memory"]?.["free"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>used</TableCell>
          <TableCell>{format(info["memory"]?.["used"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>active</TableCell>
          <TableCell>{format(info["memory"]?.["active"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>available</TableCell>
          <TableCell>{format(info["memory"]?.["available"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>buffers</TableCell>
          <TableCell>{format(info["memory"]?.["buffers"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cached</TableCell>
          <TableCell>{format(info["memory"]?.["cached"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>slab</TableCell>
          <TableCell>{format(info["memory"]?.["slab"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>buffer cache</TableCell>
          <TableCell>{format(info["memory"]?.["buffcache"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>total swap</TableCell>
          <TableCell>{format(info["memory"]?.["swaptotal"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>used swap</TableCell>
          <TableCell>{format(info["memory"]?.["swapused"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>free swap</TableCell>
          <TableCell>{format(info["memory"]?.["swapfree"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>writeback</TableCell>
          <TableCell>{format(info["memory"]?.["writeback"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>dirty</TableCell>
          <TableCell>{format(info["memory"]?.["dirty"])}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    {info["layout"].map((layout, i) => (
      <div key={i}>
        <h4 className="mt-6 font-bold">Layout - Slot {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>size</TableCell>
              <TableCell>{format(layout?.["size"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>bank</TableCell>
              <TableCell>{format(layout?.["bank"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>type</TableCell>
              <TableCell>{format(layout?.["type"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ecc</TableCell>
              <TableCell>{format(layout?.["ecc"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>clock speed</TableCell>
              <TableCell>{format(layout?.["clockSpeed"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>form factor</TableCell>
              <TableCell>{format(layout?.["formFactor"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>manufacturer</TableCell>
              <TableCell>{format(layout?.["manufacturer"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>part number</TableCell>
              <TableCell>{format(layout?.["partNum"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>serial number</TableCell>
              <TableCell>{format(layout?.["serialNum"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>configured voltage</TableCell>
              <TableCell>{format(layout?.["voltageConfigured"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>minimum voltage</TableCell>
              <TableCell>{format(layout?.["voltageMin"])}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>maximum voltage</TableCell>
              <TableCell>{format(layout?.["voltageMax"])}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    ))}
  </div>
);

export default MemoryInfo;
