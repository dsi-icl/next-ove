import TableHeader from "../table-header";
import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";
import React from "react";

const CPUInfo = ({
  info,
}: {
  info: {
    cpu: Systeminformation.CpuData;
    flags: string;
    cache: Systeminformation.CpuCacheData;
    currentSpeed: Systeminformation.CpuCurrentSpeedData;
    temperature: Systeminformation.CpuTemperatureData;
  };
}) => (
  <div>
    <h4 className="mt-6 font-bold">General</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>flags</TableCell>
          <TableCell>{format(info?.flags)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <h4 className="mt-6 font-bold">CPU</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>manufacturer</TableCell>
          <TableCell>{format(info?.cpu?.manufacturer)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>brand</TableCell>
          <TableCell>{format(info?.cpu?.brand)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>vendor</TableCell>
          <TableCell>{format(info?.cpu?.vendor)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>family</TableCell>
          <TableCell>{format(info?.cpu?.family)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>model</TableCell>
          <TableCell>{format(info?.cpu?.model)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>stepping</TableCell>
          <TableCell>{format(info?.cpu?.stepping)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>revision</TableCell>
          <TableCell>{format(info?.cpu?.revision)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>voltage</TableCell>
          <TableCell>{format(info?.cpu?.voltage)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>speed</TableCell>
          <TableCell>{format(info?.cpu?.speed)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>minimum speed</TableCell>
          <TableCell>{format(info?.cpu?.speedMin)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>maximum speed</TableCell>
          <TableCell>{format(info?.cpu?.speedMax)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>governor</TableCell>
          <TableCell>{format(info?.cpu?.governor)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cores</TableCell>
          <TableCell>{format(info?.cpu?.cores)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>physical cores</TableCell>
          <TableCell>{format(info?.cpu?.physicalCores)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>performance cores</TableCell>
          <TableCell>{format(info?.cpu?.performanceCores)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>efficiency cores</TableCell>
          <TableCell>{format(info?.cpu?.efficiencyCores)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>processors</TableCell>
          <TableCell>{format(info?.cpu?.processors)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>socket</TableCell>
          <TableCell>{format(info?.cpu?.socket)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>flags</TableCell>
          <TableCell>{format(info?.cpu?.flags)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>virtualization</TableCell>
          <TableCell>{format(info?.cpu?.virtualization)}</TableCell>
        </TableRow>
        {Object.entries(info?.cpu?.cache).map(([k, v]) => (
          <TableRow key={k}>
            <TableCell>{k} - cache</TableCell>
            <TableCell>{format(v)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <h4 className="mt-6 font-bold">Cache</h4>
    <Table>
      <TableHeader />
      <TableBody>
        {Object.entries(info?.cpu?.cache).map(([k, v]) => (
          <TableRow key={k}>
            <TableCell>{k}</TableCell>
            <TableCell>{format(v)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <h4 className="mt-6 font-bold">Speed</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>minimum</TableCell>
          <TableCell>{format(info?.currentSpeed?.min)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>maximum</TableCell>
          <TableCell>{format(info?.currentSpeed?.max)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>average</TableCell>
          <TableCell>{format(info?.currentSpeed?.avg)}</TableCell>
        </TableRow>
        {info?.currentSpeed?.cores.map((x, i) => (
          <TableRow key={i}>
            <TableCell>core - {i}</TableCell>
            <TableCell>{x}</TableCell>
          </TableRow>
        )) ?? "-"}
      </TableBody>
    </Table>
    <h4 className="mt-6 font-bold">Temperature</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>main</TableCell>
          <TableCell>{format(info?.temperature?.main)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cores</TableCell>
          <TableCell>{format(info?.temperature?.cores)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>maximum</TableCell>
          <TableCell>{format(info?.temperature?.max)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>socket</TableCell>
          <TableCell>{format(info?.temperature?.socket)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>chipset</TableCell>
          <TableCell>{format(info?.temperature?.chipset)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

export default CPUInfo;
