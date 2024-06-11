# next-ove

The next generation of the Open Visualisation Environment.

## Components

next-ove consists of three types of component - the client, the bridge and the
core.

### ove-client

**ove-client** is an Electron application used to manage the hardware of a
rendering node and to display the content.

#### ove-client-ui

**ove-client-ui** is a React application that is bundled with ove-client in
production for custom displays.

### ove-bridge

**ove-bridge** is an Electron application that manages an entire Observatory and
connects the individual constituent devices with the central cloud platform.

#### ove-bridge-ui

**ove-bridge-ui** is a React application for local management and configuration
of the Observatory and is bundled with ove-bridge.

### ove-core

**ove-core** is the cloud platform for managing all the connected Observatories,
as well as creating, updating and launching projects.

#### ove-core-ui

**ove-core-ui** is a React application providing an easy to navigate frontend
for the ove-core cloud platform and is bundled within it.

## Installation

### Development

```npm install``` - install NPM packages

```npm run prisma:push``` - update DB schemas

```npm run prisma``` - update ORM types

```npm run user:add``` - add user to DB

```npm run start``` - serve all applications, including the UI as separate services

### Production

Install the ove-client Electron application from the GitHub releases page onto
the rendering nodes within the Observatory.

Install the ove-bridge Electron application from the GitHub releases page onto a
separate machine with network connectivity to both the cloud platform and the
Observatory's devices.

Load the Docker images from the GitHub releases page using the following
command:

```docker load --input ove-core-{VERSION}.tar.gz```

This image can be run using the docker-compose.yml file in the root of the
repository:

```docker compose up -d```

It can also be run as an individual container with the following command:

```docker run --name ove-core --env-file apps/ove-core-ui/.env.docker -v ./apps/ove-core/config.production.json:/usr/src/app/config/config.json:ro -v ./tools/prisma/.env.production:/usr/src/app/.env:ro -p 8080:8080 -d ove-core-{VERSION}```

## Additional Components

Alongside the main next-ove services, integrations with a slew of additional,
optional
components help to enhance the functionality of the platform.

### MongoDB/Database

This is the only additional component that is not optional. Connection to a
Mongo database is used to manage authentication and user projects.

### Minio/S3

There is an optional integration with the S3 API compatible Minio storage
system. This can be used for storing files for use in projects.

### Calendar

Any JSON providing endpoint that matches the Microsoft Outlook schema can be
ingested, allowing for the use of Eco Mode on the Observatory, where it is
turned off and on automatically with a buffer time around events.

### IP Cameras

IP cameras for the remote monitoring of the physical space can be integrated,
providing a real-time view of what is being rendered on the displays.

### Thumbnail Generator

This can be found under the tools directory of this repository and uses an AI
model to generate thumbnails for projects to be displayed on the launcher page.

### Logging

All logs can be sent to an API for ingestion, for integration with ELK etc.

### Rendering

Any distributed rendering client can be used with next-ove, however, the
original Open Visualisation Environment (OVE) is recommended and will be
integrated to become the default in a coming release.

## Acknowledgements

- Missing Thumbnail: By Ulidin - Own work, CC BY-SA
  4.0, https://commons.wikimedia.org/w/index.php?curid=92613193
