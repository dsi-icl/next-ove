import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";
import React from "react";

const GraphicsInfo = ({
  info,
}: {
  info: { graphics: Systeminformation.GraphicsData };
}) => (
  <div>
    {info.graphics?.controllers?.map((controller, i) => (
      <div key={i}>
        <h4 className="mt-6 font-bold">Controller - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>vendor</TableCell>
              <TableCell>{format(controller?.vendor)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>model</TableCell>
              <TableCell>{format(controller?.model)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>bus</TableCell>
              <TableCell>{format(controller?.bus)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>vram</TableCell>
              <TableCell>{format(controller?.vram)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>dynamic vram</TableCell>
              <TableCell>{format(controller?.vramDynamic)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>sub-device id</TableCell>
              <TableCell>{format(controller?.subDeviceId)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>driver version</TableCell>
              <TableCell>{format(controller?.driverVersion)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>name</TableCell>
              <TableCell>{format(controller?.name)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>pci bus</TableCell>
              <TableCell>{format(controller?.pciBus)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>fan speed</TableCell>
              <TableCell>{format(controller?.fanSpeed)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>total memory</TableCell>
              <TableCell>{format(controller?.memoryTotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>used memory</TableCell>
              <TableCell>{format(controller?.memoryUsed)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>free memory</TableCell>
              <TableCell>{format(controller?.memoryFree)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>memory utilisation</TableCell>
              <TableCell>{format(controller?.utilizationMemory)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>gpu temperature</TableCell>
              <TableCell>{format(controller?.temperatureGpu)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>power draw</TableCell>
              <TableCell>{format(controller?.powerDraw)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>power limit</TableCell>
              <TableCell>{format(controller?.powerLimit)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>clock core</TableCell>
              <TableCell>{format(controller?.clockCore)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>clock memory</TableCell>
              <TableCell>{format(controller?.clockMemory)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
    {info.graphics?.displays?.map((display, i) => (
      <div key={i}>
        <h4 className="mt-6 font-bold">Display - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>vendor</TableCell>
              <TableCell>{format(display?.vendor)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>model</TableCell>
              <TableCell>{format(display?.model)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>device name</TableCell>
              <TableCell>{format(display?.deviceName)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>main</TableCell>
              <TableCell>{format(display?.main)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>builtin</TableCell>
              <TableCell>{format(display?.builtin)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>connection</TableCell>
              <TableCell>{format(display?.connection)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>resolution</TableCell>
              <TableCell>
                {format(display?.resolutionX)}x{format(display?.resolutionY)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>size</TableCell>
              <TableCell>
                {format(display?.sizeX)}x{format(display?.sizeY)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>pixel depth</TableCell>
              <TableCell>{format(display?.pixelDepth)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>current resolution</TableCell>
              <TableCell>
                {format(display?.currentResX)}x{format(display?.currentResY)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>position</TableCell>
              <TableCell>
                {format(display?.positionX)}x{format(display?.positionY)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>current refresh rate</TableCell>
              <TableCell>{format(display?.currentRefreshRate)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
  </div>
);

export default GraphicsInfo;
