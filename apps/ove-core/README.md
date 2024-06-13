# ove-core

ove-core is the cloud platform for controlling and operating Observatories, as
well as for creating and managing visualisation projects.

## Environment

The environment configuration is located at apps/ove-core/src/config/config.json
within the repository, or loaded into the Docker container at
/usr/src/app/config/config.json.
An [example configuration file](./src/config/config.example.json) is also
provided.

**Variables**

## Local Development

To run ove-core locally, use the following commands:

```shell
npm install
npx nx run ove-core-ui:serve
npx nx run ove-core:serve
```

## Building

To build ove-core locally, use the following commands:

```shell
npm install
npx nx run ove-core-ui:build
npx nx run ove-core:build
```

The ove-core-ui folder will contain dummy environment variables, which are
substituted using the env.sh script in the apps/ove-core-ui directory.

## Dockerizing

To build ove-core as a Docker image, use the following commands, for Intel and Arm builds respectively:

```shell
docker build --no-cache --progress=plain -t next-ove-core:latest --platform linux/amd64 -f apps/ove-core/Dockerfile .
```

```shell
docker build --no-cache --progress=plain -t next-ove-core:latest-arm --platform linux/arm64 -f apps/ove-core/Dockerfile .
```

## Installing from Release

Load the Docker images from the GitHub releases page using the following
command:

```shell
docker load --input next-ove-core-latest(-arm).tar.gz
```

This image can be run using the docker-compose.yml file in the root of the
repository:

```shell
docker compose up -d
```

It can also be run as an individual container with the following command:

```shell
docker run --name ove-core --env-file apps/ove-core-ui/.env.docker -v ./apps/ove-core/config.production.json:/usr/src/app/config/config.json:ro -v ./tools/db/.env.production:/usr/src/app/.env:ro -p 8080:8080 -d next-ove-core:latest(-arm)
```
