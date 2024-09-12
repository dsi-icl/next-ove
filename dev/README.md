# Setup for development

## Services

- ```mongo``` - central database for auth, project management etc.
- ```mongo-express``` - frontend for mongo service
- ```minio``` - asset storage using the S3 API
- ```static``` - static assets for local mocking of optional external services

### Environment

Please refer to the ```.env.example``` files for an example environment
configuration.

### Mongo Setup

[Setup Guide](!https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set-with-keyfile-access-control/)

Please execute the following command on instantiation of the MongoDB ReplicaSet:

```shell
openssl rand -base64 756 > services/config/mongo.keyfile
chmod 400 services/config/mongo.keyfile
```

```shell
docker exec mongo <SHELL_SCRIPT>
```

Shell Script:

```shell
mongosh --eval "rs.initiate({"_id": "rs0", "version": 1, "members": [{"_id": 0, host: "127.0.0.1:27017", "priority": 1}]})" --username <ROOT_USERNAME> --password
```

To reset the ReplicaSet, delete the local files being mounted for the database,
delete the container and rerun.

### Static Setup

Add any mock assets for external integrations to be served over HTTP.

Examples include the monitoring camera service and calendar integrations.

These assets are stored in the ```public``` directory and loaded in when
the ```static``` image is built.

### Notes

- if behind reverse proxy bridge must have socket path =
  /{REVERSE_PROXY_PATH}/{CORE_SOCKET_PATH}

## Files

### services/static/Dockerfile

Dockerfile for basic Node HTTP server for dummying static files, i.e. calendar
JSON, IP camera HTML feeds.

### services/static/public/

Directory for storing static assets to be served. Gets mounted into Docker
image.

### cli/auto-populate/data/global_buckets/

Directory for storing test global assets for loading into Minio storage and
available to all projects.

### services/data/minio/data/

Mounted volume for Minio service.

### services/data/mongo/database/

Mounted volume for MongoDB service.

### deployment/config/.env.release.example

Example environment for storing GitHub token used for releasing artefacts.

### deployment/config/

Directory for storing deployment configurations

### deployment/scripts/

Directory for storing deployment scripts

### deployment/scripts/build-bridge.sh

Script for building and optionally releasing the ove-bridge Electron
application. Accepts platform, arch and release as arguments, as described under
the script's help option.

### deployment/scripts/build-client.sh

Script for building and optionally releasing the ove-client Electron
application. Accepts platform, arch and release as arguments, as described under
the script's help option.

### deployment/scripts/build-core.sh

Script for building and saving the ove-core Docker image. Accepts platform,
version and no-cache as arguments, as described under the script's help option.

### cli/analyse.sh

Script for running all analysis tooling, linting and tests, providing a
comprehensive view of the state of the project, as well as generating additional
documentation.

### services/auto-populate/data/credentials.example.json

Example credentials.json file to be auto-populated into the database by the
auto-populate.js script. One admin user and the credentials of a bridge are
recommended to be provided.

### services/config/dev.example.conf

Example nginx configuration for testing services behind a reverse proxy.

### services/docker-compose.yml

Docker Compose file for managing development services.

### cli/generate-token.js

Script for generating JWTs from next-ove for authenticating the REST API without
using ove-core-ui.

### services/config/MapLayer.example.json

Example MapLayers.json file for configuring the available layers to the OVE Maps
App.

### cli/mdc-control.js

Script for controlling MDC screens, based on next-ove implementation.

### testing/mock-bridge.js

Script for creating a mock ove-bridge instance, allowing dummy data to be passed
to the core cloud platform.

### services/config/ove_networks_config.example.json

Example ove_networks_config.json file for configuring the presets to the OVE
Networks App.

### cli/remove-optional-deps.sh

tree-sitter is currently being installed as an optional dependency of
swagger-ui. All functionality is separate from this library, and as it fails to
locate the necessary native binaries for Electron packaging, this is a utility
script for removing them.
