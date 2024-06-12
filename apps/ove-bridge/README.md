# ove-bridge

ove-bridge acts as the heart of an individual Observatory, providing
configuration and control over the Observatory, as well as connecting it to the
remote cloud platform.

## Environment

The environment configuration is located under the application data folder for
next-ove on the device, with the filename ove-bridge-config.json.
An [example configuration file](./ove-bridge-config.example.json) can be found
in this directory.

**Variables**

- RENDER_CONFIG - when under development, ove-bridge-ui is not bundled with the
  Electron app, but served as a separate React application. This specified the
  location of the React app to ove-bridge
    - PORT - ove-bridge-ui port
    - HOSTNAME - ove-bridge-ui hostname
    - PROTOCOL - ove-bridge-ui protocol, i.e. http, https
- LOGGING_SERVER - URL for ingesting logging information for storage and
  processing.
- SOCKET_PATH - Socket.IO path, defaults to /socket.io
- LOG_LEVEL - maximum visible level for logging. 0 for fatal errors, 1 for
  errors, 2 for warnings, 3 for info, 4 for debugging and 5 for traces.
- CORE_URL - url for accessing the ove-core cloud platform.
- BRIDGE_NAME - name of the Observatory.
- POWER_MODE - there are three available power modes. Manual provides full
  control over turning the Observatory off and on. Auto turns the Observatory
  off and on to a schedule. Eco turns the Observatory off and on based on
  calendar events, with a specified buffer time.
- HARDWARE - an array of information on the devices that comprise the
  Observatory
    - id - unique device ID
    - name - human-readable name for device
    - ip - address of device on network
    - port - port of device on network
    - protocol - protocol for accessing device on network, i.e. http
    - type - node for rendering nodes running the ove-client, mdc for displays
      compatible with the MDC standard and pjlink for displays compatible with
      the PJLink standard
    - mac - MAC address for device
    - tags - allows for grouping devices together, i.e. associating screens with
      the rendering node their cables connect to
    - auth - authentication credentials for the device
- PRIVATE_KEY - private key for bridge authentication
- PUBLIC_KEY - public key for bridge authentication
- PASSPHRASE - passphrase for public/private key pair
- GEOMETRY - specifies the geometry of the Observatory
    - width - display ratio width, i.e. 16
    - height - display ratio height, i.e. 9
    - rows - number of rows of displays
    - columns - number of columns of displays
    - displays - array of displays that constitute the Observatory
        - displayId - ID of display device
        - renderer - rendering node associated with display
            - deviceId - ID of rendering node
            - displayId - ID of display on rendering node
        - row - row of Observatory that the display is in
        - column - column of Observatory that the display is in
- CALENDAR_URL - url for calendar integration when running in Eco mode, any JSON
  providing endpoint that conforms to the necessary schema, (Microsoft Outlook),
  will be suitable
- CALENDAR - processed record of calendar events
- AUTO_SCHEDULE - schedule for automatic operation of the Observatory
    - wake - wake time for the Observatory in the format hh:mm
    - sleep - sleep time for the Observatory in the format hh:mm
    - schedule - array of booleans for whether to operate the Observatory on
      that day, 0 - 6, Sunday - Saturday
- VIDEO_STREAMS - array of urls for accessing any IP cameras to provide remote
  monitoring of the Observatory
- START_VIDEO_SCRIPT - location of script file for starting the IP cameras if
  CCTV is not persistent
- STOP_VIDEO_SCRIPT - location of script file for stopping the IP cameras if
  CCTV is not persistent
- SYN_SCAN_COMMAND - command for SYN scanning the status of a device
- ARP_SCAN_COMMAND - command for ARP scanning the status of a device
- NODE_TIMEOUT - timeout for connecting to rendering nodes
- MDC_TIMEOUT - timeout for connecting to MDC compatible displays
- PJLINK_TIMEOUT - timeout for connecting to PJLink compatible displays
- RECONCILIATION_TIMEOUT - interval for running device state reconciliation
- RECONCILIATION_ERROR_TIMEOUT - interval for retry failing reconciliation
  commands
- WOL_ADDRESS - broadcast address for Wake on LAN over the network

## Local Development

To run ove-bridge locally, use the following commands:

```shell
npm install
npx nx run ove-bridge-ui:serve
npx nx run ove-bridge:serve
```

The public key and name of the bridge, with a role of "bridge" needs to be added
to the User table of the Mongo database.

## Building

To build ove-bridge locally, use the following commands:

```shell
npm install
npx nx run ove-bridge:build
npx nx run ove-bridge:make:{PLATFORM}
```

where PLATFORM is the operating system of the building device, windows, linux or
mac.

## Installing from Release

Download the Electron application for the desired operating system from the
next-ove GitHub Releases page.
