# ove-client

ove-client provides hardware management and display control for the rendering
nodes of the Observatory.

## Environment

The environment configuration is located under the application data folder for
next-ove on the device, with the filename ove-client-config.json.
An [example configuration file](./ove-client-config.example.json) can be found
in this directory.

**Variables**

- HOSTNAME - hostname to run local server on, i.e. 0.0.0.0
- PORT - port to run local server on, i.e. 8080
- PROTOCOL - protocol that the local server will be accessible on, i.e. http
- RENDER_CONFIG - when under development, ove-client-ui is not bundled with the
  Electron app, but served as a separate React application. This specified the
  location of the React app to ove-client
    - HOSTNAME - hostname of React app
    - PROTOCOL - protocol to access the React app on, i.e. http
    - PORT - port of React app
- BROWSER_DELAY - initialisation delay before loading browsers on application
  open
- LOGGING_SERVER - URL for ingesting logging information for storage and
  processing.
- LOG_LEVEL - maximum visible level for logging. 0 for fatal errors, 1 for
  errors, 2 for warnings, 3 for info, 4 for debugging and 5 for traces
- AUTHORISED_CREDENTIALS - any credentials that have been authenticated against
  the client. Should correspond to the public key of the associated ove-bridge
- AUTH_ERROR_LIMIT - number of authentication attempts before preventing further
  retries
- WINDOW_CONFIG - map of display IDs with rendering URLs to be opened by default
  once authenticated

## Local Development

To run ove-client locally, use the following commands:

```shell
npm install
npx nx run ove-client-ui:serve
npx nx run ove-client:serve
```

## Building

To build ove-client locally, use the following commands:

```shell
npm install
npx nx run ove-client:build
npx nx run ove-client:make:{PLATFORM}
```

where PLATFORM is the operating system of the building device - windows, linux
or
mac.

## Installing from Release

Download the Electron application for the desired operating system from the
next-ove GitHub Releases page.
