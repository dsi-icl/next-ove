# next-ove

The next generation of the Open Visualisation Environment.

## Components

next-ove consists of three types of component - the client, the bridge and the
core, as well as a built in renderer for the distributed of different data
types, such as images, videos and maps. In addition to this, there are optional
components for handling documentation,
logging, thumbnail generation and custom text formatting, as well as a Chrome
extension for synchronising user input to web pages.

### ove-client

**ove-client** is an Electron application used to manage the hardware of a
rendering node and to display the content.

Further documentation on this component can be found at
the [ove-client README](./apps/ove-client/README.md).

### ove-bridge

**ove-bridge** is an NodeJS service that manages an entire Observatory and
connects the individual constituent devices with the central cloud platform.

Further documentation on this component can be found at
the [ove-bridge README](./apps/ove-bridge/README.md).

### ove-core

**ove-core** is the cloud platform for managing all the connected Observatories,
as well as creating, updating and launching projects.

Further documentation on this component can be found at
the [ove-core README](./apps/ove-core/README.md).

#### ove-core-ui

**ove-core-ui** is a React application providing an easy to navigate dashboard
for the ove-core cloud platform and is bundled within it.

### ove-docs

**ove-docs** is a standalone ExpressJS server for rendering the
documentation gathered using the cli utility.

### ove-data-formatter

**ove-data-formatter** is a standalone Flask server for formatting Markdown and
Latex into HTML.

### ove-logs

**ove-logs** is a standalone ExpressJS server for recording and accessing the
logs from all components of the platform.

It relies on a separate SQLite database and limits the size and number of
records through regular cleanup to prevent storage issues.

### ove-mirror

**ove-mirror** is a Chrome browser extension for capturing and propagating user
inputs, including clicks, scrolls and key events, from the controllers to the
corresponding views. This allows for the distributing of interactions with
arbitrary
websites, removing the need for custom websocket-based implementations.

### ove-renderer

**ove-renderer** is the distributed rendering engine for handling the display of
both the controllers and views for the visualisations. It has native handling
for multiple data types, including web pages, images, maps, networks, videos and
screen shares.

### ove-thumbnail-generator

**ove-thumbnail-generator** is a standalone Flask server that loads a generative
image model and takes the project metadata to generate a thumbnail for use on
the launcher.

## Installation

This project uses PNPM for package management and NX for managing the components
of the monorepo. Set the following alias in your terminal configuration to use
the ```pnx``` command in the package.json:

```bash
alias pnx='pnpm --offline nx'
```

### Development

```npm install -g pnpm```

```pnpm install``` - install NPM packages

```pnpm db push``` - update DB schemas

```pnpm db sync``` - update ORM types

```pnpm db user -- --action=add``` - add user to DB

```pnpm start``` - serve all applications, including the UI as separate
services

### Production

Install the ove-client Electron application from the GitHub releases page onto
the rendering nodes within the Observatory.

Install the ove-bridge Electron application from the GitHub releases page onto a
separate machine with network connectivity to both the cloud platform and the
Observatory's devices.

Load the Docker images from the GitHub releases page using the following
command:

```shell
docker load --input next-ove-core-{VERSION}.tar.gz
```

This image can be run using the docker-compose.yml file in the root of the
repository:

```shell
docker compose up -d
```

It can also be run as an individual container with the following command:

```shell
docker run --name ove-core --env-file apps/ove-core-ui/.env.docker -v ./apps/ove-core/config.production.json:/usr/src/app/config/config.json:ro -v ./tools/db/.env.production:/usr/src/app/.env:ro -p 8080:8080 -d ove-core-{VERSION}
```

## Additional Components

Alongside the main next-ove services, integrations with a slew of additional,
optional
components help to enhance the functionality of the platform.

### MongoDB/Database

This is the only additional component that is not optional. Connection to a
Mongo database is used to manage authentication and user projects.

For local development, a container can be created via the Docker Compose file
provided under the dev directory. Additional commands are required to run it as
a ReplicaSet, which are provided in the [README](./dev/README.md).

For use in production systems, please follow the steps and guides on
the [MongoDB website](https://www.mongodb.com/docs/manual/installation/).

### Minio/S3

There is an optional integration with the S3 API compatible Minio storage
system. This can be used for storing files for use in projects.

For local development, a container can be created via the Docker Compose file
provided under the dev directory.

For use in production systems, please follow the steps and guides on
the [Minio website](https://min.io/docs/minio/linux/operations/installation.html).

### Calendar

Any JSON providing endpoint that matches the Microsoft Outlook schema can be
ingested, allowing for the use of Eco Mode on the Observatory, where it is
turned off and on automatically with a buffer time around events.

For information on integrating a Microsoft calendar, please follow the
instructions on
the [Microsoft website](https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview).

### IP Cameras

IP cameras for the remote monitoring of the physical space can be integrated,
providing a real-time view of what is being rendered on the displays.

### Thumbnail Generator

This can be found under the tools directory of this repository and uses an AI
model to generate thumbnails for projects to be displayed on the launcher page.

Information for configuring this auth can be found in
the [README](./tools/thumbnail-generator/README.md).

## Notes

- Feature documentation has the following naming convention:
    - all lowercase
    - words separated by hyphens
    - must be a pandoc convertible type, e.g. md. More information on supported
      input types can be found
      at https://en.wikipedia.org/wiki/Pandoc#Supported_file_formats.

## Acknowledgements

- Missing Thumbnail: By Ulidin - Own work, CC BY-SA
  4.0, https://commons.wikimedia.org/w/index.php?curid=92613193
