import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";
import React from "react";

const FSInfo = ({
  info,
}: {
  info: {
    diskLayout: Systeminformation.DiskLayoutData[];
    blockDevices: Systeminformation.BlockDevicesData[];
    disksIO: Systeminformation.DisksIoData;
    fsSize: Systeminformation.FsSizeData[];
    fsOpenFiles: Systeminformation.FsOpenFilesData;
    fsStats: Systeminformation.FsStatsData;
  };
}) => (
  <div>
    {info.diskLayout?.map((layout, i) => (
      <div key={i}>
        <h4 className="mt-6 font-bold">Disk Layout - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>device</TableCell>
              <TableCell>{format(layout?.device)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>type</TableCell>
              <TableCell>{format(layout?.type)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>name</TableCell>
              <TableCell>{format(layout?.name)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>vendor</TableCell>
              <TableCell>{format(layout?.vendor)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>size</TableCell>
              <TableCell>{format(layout?.size)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>bytes per sector</TableCell>
              <TableCell>{format(layout?.bytesPerSector)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>total cylinders</TableCell>
              <TableCell>{format(layout?.totalCylinders)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>total heads</TableCell>
              <TableCell>{format(layout?.totalHeads)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>total sectors</TableCell>
              <TableCell>{format(layout?.totalSectors)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>total tracks</TableCell>
              <TableCell>{format(layout?.totalTracks)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>tracks per cylinder</TableCell>
              <TableCell>{format(layout?.tracksPerCylinder)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>sectors per track</TableCell>
              <TableCell>{format(layout?.sectorsPerTrack)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>firmware revision</TableCell>
              <TableCell>{format(layout?.firmwareRevision)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>serial number</TableCell>
              <TableCell>{format(layout?.serialNum)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>interface type</TableCell>
              <TableCell>{format(layout?.interfaceType)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>smart status</TableCell>
              <TableCell>{format(layout?.smartStatus)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>temperature</TableCell>
              <TableCell>{format(layout?.temperature)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
    {info.blockDevices?.map((device, i) => (
      <div key={i}>
        <h4 className="mt-6 font-bold">Block Device - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>name</TableCell>
              <TableCell>{format(device?.name)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>identifier</TableCell>
              <TableCell>{format(device?.identifier)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>type</TableCell>
              <TableCell>{format(device?.type)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>fs type</TableCell>
              <TableCell>{format(device?.fsType)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>mount</TableCell>
              <TableCell>{format(device?.mount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>size</TableCell>
              <TableCell>{format(device?.size)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>physical</TableCell>
              <TableCell>{format(device?.physical)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>uuid</TableCell>
              <TableCell>{format(device?.uuid)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>label</TableCell>
              <TableCell>{format(device?.label)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>model</TableCell>
              <TableCell>{format(device?.model)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>serial</TableCell>
              <TableCell>{format(device?.serial)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>removable</TableCell>
              <TableCell>{format(device?.removable)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>protocol</TableCell>
              <TableCell>{format(device?.protocol)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>group</TableCell>
              <TableCell>{format(device?.group)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>device</TableCell>
              <TableCell>{format(device?.device)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
    <h4 className="mt-6 font-bold">Disk IO</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>read io</TableCell>
          <TableCell>{format(info.disksIO?.rIO)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>write io</TableCell>
          <TableCell>{format(info.disksIO?.wIO)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>total io</TableCell>
          <TableCell>{format(info.disksIO?.tIO)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>read io per second</TableCell>
          <TableCell>{format(info.disksIO?.rIO_sec)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>write io per second</TableCell>
          <TableCell>{format(info.disksIO?.wIO_sec)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>total io per second</TableCell>
          <TableCell>{format(info.disksIO?.tIO_sec)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>read wait time</TableCell>
          <TableCell>{format(info.disksIO?.rWaitTime)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>write wait time</TableCell>
          <TableCell>{format(info.disksIO?.wWaitTime)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>total wait time</TableCell>
          <TableCell>{format(info.disksIO?.tWaitTime)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>read wait percentage</TableCell>
          <TableCell>{format(info.disksIO?.rWaitPercent)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>write wait percentage</TableCell>
          <TableCell>{format(info.disksIO?.wWaitPercent)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>total wait percentage</TableCell>
          <TableCell>{format(info.disksIO?.tWaitPercent)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>interval length (ms)</TableCell>
          <TableCell>{format(info.disksIO?.ms)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    {info.fsSize?.map((fs, i) => (
      <div key={i}>
        <h4 className="mt-6 font-bold">FS Size - {fs?.fs}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>type</TableCell>
              <TableCell>{format(fs?.type)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>size</TableCell>
              <TableCell>{format(fs?.size)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>used</TableCell>
              <TableCell>{format(fs?.used)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>available</TableCell>
              <TableCell>{format(fs?.available)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>usage</TableCell>
              <TableCell>{format(fs?.use)}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>mount</TableCell>
              <TableCell>{format(fs?.mount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>read only</TableCell>
              <TableCell>{format(!fs?.rw)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
    <h4 className="mt-6 font-bold">Open Files</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>maximum</TableCell>
          <TableCell>{format(info.fsOpenFiles?.max)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>allocated</TableCell>
          <TableCell>{format(info.fsOpenFiles?.allocated)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>available</TableCell>
          <TableCell>{format(info.fsOpenFiles?.available)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <h4 className="mt-6 font-bold">Statistics</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>bytes read</TableCell>
          <TableCell>{format(info.fsStats?.rx)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>bytes written</TableCell>
          <TableCell>{format(info.fsStats?.wx)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>total bytes read/written</TableCell>
          <TableCell>{format(info.fsStats?.tx)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>bytes read per second</TableCell>
          <TableCell>{format(info.fsStats?.rx_sec)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>bytes written per second</TableCell>
          <TableCell>{format(info.fsStats?.wx_sec)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>total bytes read/written per second</TableCell>
          <TableCell>{format(info.fsStats?.tx_sec)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>interval length (ms)</TableCell>
          <TableCell>{format(info.fsStats?.ms)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

export default FSInfo;
