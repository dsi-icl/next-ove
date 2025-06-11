import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";
import React from "react";

const DockerInfo = ({
  info,
}: {
  info: {
    docker: Systeminformation.DockerInfoData;
    images: Systeminformation.DockerImageData[];
    containers: Systeminformation.DockerContainerData[];
    containerStats: Systeminformation.DockerContainerStatsData[];
    containerProcesses: (Systeminformation.DockerContainerProcessData & {
      id: string;
    })[];
    volumes: Systeminformation.DockerVolumeData[];
  };
}) => (
  <div>
    <h4 className="mt-6 font-bold">General</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>id</TableCell>
          <TableCell>{format(info?.docker?.id)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>containers</TableCell>
          <TableCell>{format(info?.docker?.containers)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>containers running</TableCell>
          <TableCell>{format(info?.docker?.containersRunning)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>containers paused</TableCell>
          <TableCell>{format(info?.docker?.containersPaused)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>containers stopped</TableCell>
          <TableCell>{format(info?.docker?.containersStopped)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>images</TableCell>
          <TableCell>{format(info?.docker?.images)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>driver</TableCell>
          <TableCell>{format(info?.docker?.driver)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>memory limit</TableCell>
          <TableCell>{format(info?.docker?.memoryLimit)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>swap limit</TableCell>
          <TableCell>{format(info?.docker?.swapLimit)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>kernel memory</TableCell>
          <TableCell>{format(info?.docker?.kernelMemory)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu cfs period</TableCell>
          <TableCell>{format(info?.docker?.cpuCfsPeriod)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu cfs quota</TableCell>
          <TableCell>{format(info?.docker?.cpuCfsQuota)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu shares</TableCell>
          <TableCell>{format(info?.docker?.cpuShares)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu set</TableCell>
          <TableCell>{format(info?.docker?.cpuSet)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ipv4 forwarding</TableCell>
          <TableCell>{format(info?.docker?.ipv4Forwarding)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>bridge nf ip tables</TableCell>
          <TableCell>{format(info?.docker?.bridgeNfIptables)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>bridge nf ip6 tables</TableCell>
          <TableCell>{format(info?.docker?.bridgeNfIp6tables)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>debug</TableCell>
          <TableCell>{format(info?.docker?.debug)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>nfd</TableCell>
          <TableCell>{format(info?.docker?.nfd)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>oom kill disable</TableCell>
          <TableCell>{format(info?.docker?.oomKillDisable)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>goroutines number</TableCell>
          <TableCell>{format(info?.docker?.ngoroutines)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>system time</TableCell>
          <TableCell>{format(info?.docker?.systemTime)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>logging driver</TableCell>
          <TableCell>{format(info?.docker?.loggingDriver)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>c-group driver</TableCell>
          <TableCell>{format(info?.docker?.cgroupDriver)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>event listener number</TableCell>
          <TableCell>{format(info?.docker?.nEventsListener)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>kernel version</TableCell>
          <TableCell>{format(info?.docker?.kernelVersion)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>operating system</TableCell>
          <TableCell>{format(info?.docker?.operatingSystem)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>os type</TableCell>
          <TableCell>{format(info?.docker?.osType)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>architecture</TableCell>
          <TableCell>{format(info?.docker?.architecture)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu number</TableCell>
          <TableCell>{format(info?.docker?.ncpu)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>total memory</TableCell>
          <TableCell>{format(info?.docker?.memTotal)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>docker root directory</TableCell>
          <TableCell>{format(info?.docker?.dockerRootDir)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>http proxy</TableCell>
          <TableCell>{format(info?.docker?.httpProxy)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>https proxy</TableCell>
          <TableCell>{format(info?.docker?.httpsProxy)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>no proxy</TableCell>
          <TableCell>{format(info?.docker?.noProxy)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>name</TableCell>
          <TableCell>{format(info?.docker?.name)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>labels</TableCell>
          <TableCell>{format(info?.docker?.labels)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>experimental build</TableCell>
          <TableCell>{format(info?.docker?.experimentalBuild)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>server version</TableCell>
          <TableCell>{format(info?.docker?.serverVersion)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cluster store</TableCell>
          <TableCell>{format(info?.docker?.clusterStore)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cluster advertise</TableCell>
          <TableCell>{format(info?.docker?.clusterAdvertise)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>default runtime</TableCell>
          <TableCell>{format(info?.docker?.defaultRuntime)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>live restore enabled</TableCell>
          <TableCell>{format(info?.docker?.liveRestoreEnabled)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>isolation</TableCell>
          <TableCell>{format(info?.docker?.isolation)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>init binary</TableCell>
          <TableCell>{format(info?.docker?.initBinary)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>product license</TableCell>
          <TableCell>{format(info?.docker?.productLicense)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    {info.images?.map((image, i) => (
      <div key={image.id}>
        <h4 className="mt-6 font-bold">Image - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>id</TableCell>
              <TableCell>{format(image?.id)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>container</TableCell>
              <TableCell>{format(image?.container)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>comment</TableCell>
              <TableCell>{format(image?.comment)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>os</TableCell>
              <TableCell>{format(image?.os)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>architecture</TableCell>
              <TableCell>{format(image?.architecture)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>parent</TableCell>
              <TableCell>{format(image?.parent)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>docker version</TableCell>
              <TableCell>{format(image?.dockerVersion)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>size</TableCell>
              <TableCell>{format(image?.size)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>shared size</TableCell>
              <TableCell>{format(image?.sharedSize)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>virtual size</TableCell>
              <TableCell>{format(image?.virtualSize)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>author</TableCell>
              <TableCell>{format(image?.author)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>created</TableCell>
              <TableCell>
                {new Date(image?.created ?? 0).toISOString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>container config</TableCell>
              <TableCell>{format(image?.containerConfig)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>graph driver</TableCell>
              <TableCell>{format(image?.graphDriver)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>repository digests</TableCell>
              <TableCell>{format(image?.repoDigests)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>repository tags</TableCell>
              <TableCell>{format(image?.repoTags)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>config</TableCell>
              <TableCell>{format(image?.config)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>root file system</TableCell>
              <TableCell>{format(image?.rootFS)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
    {info.containers?.map((container, i) => (
      <div key={container.id}>
        <h4 className="mt-6 font-bold">Container - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>id</TableCell>
              <TableCell>{format(container?.id)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>name</TableCell>
              <TableCell>{format(container?.name)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>image</TableCell>
              <TableCell>{format(container?.image)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>image id</TableCell>
              <TableCell>{format(container?.imageID)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>command</TableCell>
              <TableCell>{format(container?.command)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>created</TableCell>
              <TableCell>
                {new Date(container?.created).toISOString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>started</TableCell>
              <TableCell>
                {new Date(container?.started).toISOString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>finished</TableCell>
              <TableCell>
                {new Date(container?.finished).toISOString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>created at</TableCell>
              <TableCell>{format(container?.createdAt)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>started at</TableCell>
              <TableCell>{format(container?.startedAt)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>finished at</TableCell>
              <TableCell>{format(container?.finishedAt)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>state</TableCell>
              <TableCell>{format(container?.state)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>restart count</TableCell>
              <TableCell>{format(container?.restartCount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>platform</TableCell>
              <TableCell>{format(container?.platform)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>driver</TableCell>
              <TableCell>{format(container?.driver)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ports</TableCell>
              <TableCell>{format(container?.ports)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
    {info.containers
      ?.flatMap((container) =>
        container.mounts.map((mount) => ({ id: container.id, ...mount })),
      )
      .map((mount, i) => (
        <div key={mount.id}>
          <h4 className="mt-6 font-bold">Container Mount - {i}</h4>
          <Table>
            <TableHeader />
            <TableBody>
              <TableRow>
                <TableCell>container id</TableCell>
                <TableCell>{format(mount?.id)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>type</TableCell>
                <TableCell>{format(mount?.Type)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>source</TableCell>
                <TableCell>{format(mount?.Source)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>destination</TableCell>
                <TableCell>{format(mount?.Destination)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>mode</TableCell>
                <TableCell>{format(mount?.Mode)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>read only</TableCell>
                <TableCell>{format(!mount?.RW)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>propagation</TableCell>
                <TableCell>{format(mount?.Propagation)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )) ?? null}
    {info.containerStats?.map((stats, i) => (
      <div key={stats.id}>
        <h4 className="mt-6 font-bold">Container Stats - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>id</TableCell>
              <TableCell>{format(stats?.id)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>memory usage</TableCell>
              <TableCell>{format(stats?.memUsage)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>memory limit</TableCell>
              <TableCell>{format(stats?.memLimit)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>memory percentage</TableCell>
              <TableCell>{format(stats?.memPercent)}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>cpu percentage</TableCell>
              <TableCell>{format(stats?.cpuPercent)}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>pids</TableCell>
              <TableCell>{format(stats?.pids)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>network bytes read</TableCell>
              <TableCell>{format(stats?.netIO?.rx)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>network bytes written</TableCell>
              <TableCell>{format(stats?.netIO?.wx)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>blockio bytes read</TableCell>
              <TableCell>{format(stats?.blockIO.r)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>blockio bytes written</TableCell>
              <TableCell>{format(stats?.blockIO.w)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>restart count</TableCell>
              <TableCell>{format(stats?.restartCount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>cpu stats</TableCell>
              <TableCell>{format(stats?.cpuStats)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>pre-cpu stats</TableCell>
              <TableCell>{format(stats?.precpuStats)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>memory stats</TableCell>
              <TableCell>{format(stats?.memoryStats)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>networks</TableCell>
              <TableCell>{format(stats?.networks)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
    {info.containerProcesses?.map((process, i) => (
      <div key={i}>
        <h4 className="mt-6 font-bold">Container Processes - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>container id</TableCell>
              <TableCell>{format(process?.id)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>host process id</TableCell>
              <TableCell>{format(process?.pidHost)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>parent process id</TableCell>
              <TableCell>{format(process?.ppid)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>process group id</TableCell>
              <TableCell>{format(process?.pgid)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>user</TableCell>
              <TableCell>{format(process?.user)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>real user</TableCell>
              <TableCell>{format(process?.ruser)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>group</TableCell>
              <TableCell>{format(process?.group)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>real group</TableCell>
              <TableCell>{format(process?.rgroup)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>state</TableCell>
              <TableCell>{format(process?.stat)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>time</TableCell>
              <TableCell>{format(process?.time)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>elapsed</TableCell>
              <TableCell>{format(process?.elapsed)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>nice</TableCell>
              <TableCell>{format(process?.nice)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>resident set size</TableCell>
              <TableCell>{format(process?.rss)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>virtual size (kb)</TableCell>
              <TableCell>{format(process?.vsz)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>command</TableCell>
              <TableCell>{format(process?.command)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
    {info.volumes?.map((volume, i) => (
      <div key={i}>
        <h4 className="mt-6 font-bold">Volume - {i}</h4>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>name</TableCell>
              <TableCell>{format(volume?.name)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>driver</TableCell>
              <TableCell>{format(volume?.driver)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>labels</TableCell>
              <TableCell>{format(volume?.labels)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>mount point</TableCell>
              <TableCell>{format(volume?.mountpoint)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>options</TableCell>
              <TableCell>{format(volume?.options)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>scope</TableCell>
              <TableCell>{format(volume?.scope)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>created</TableCell>
              <TableCell>{new Date(volume?.created).toISOString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )) ?? null}
  </div>
);

export default DockerInfo;
